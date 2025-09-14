import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClickHouseConfig {
  url: string
  protocol: string
  port: number
  user: string
  password: string
  database: string
  timeout: number
  maxRetries: number
  sslEnabled: boolean
  apiKey: string
  adminUser: string
  adminPassword: string
}

class ClickHouseClient {
  private config: ClickHouseConfig

  constructor(config: ClickHouseConfig) {
    this.config = config
  }

  private buildConnectionUrl(): string {
    const protocol = this.config.sslEnabled ? 'https' : 'http'
    return `${protocol}://${this.config.url}:${this.config.port}`
  }

  async query(sql: string, useAdminCredentials = false): Promise<any> {
    const baseUrl = this.buildConnectionUrl()
    const user = useAdminCredentials ? this.config.adminUser : this.config.user
    const password = useAdminCredentials ? this.config.adminPassword : this.config.password
    
    const url = new URL(baseUrl)
    url.searchParams.set('query', sql)
    url.searchParams.set('database', this.config.database)
    url.searchParams.set('user', user)
    url.searchParams.set('password', password)

    console.log(`Executing ClickHouse query: ${sql}`)
    console.log(`Using ${useAdminCredentials ? 'admin' : 'regular'} credentials`)
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout * 1000)
        
        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'X-ClickHouse-User': user,
            'X-ClickHouse-Key': password,
            'X-API-Key': this.config.apiKey,
            'Content-Type': 'text/plain'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const result = await response.text()
          console.log(`Query successful on attempt ${attempt}`)
          return { success: true, data: result, attempt }
        } else {
          const error = await response.text()
          console.error(`Query failed on attempt ${attempt}: ${error}`)
          
          if (attempt === this.config.maxRetries) {
            return { success: false, error: `Failed after ${attempt} attempts: ${error}` }
          }
        }
      } catch (error) {
        console.error(`Connection error on attempt ${attempt}:`, error)
        
        if (attempt === this.config.maxRetries) {
          return { success: false, error: `Connection failed after ${attempt} attempts: ${error.message}` }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  async testConnection(): Promise<any> {
    console.log('Testing ClickHouse connection...')
    return await this.query('SELECT version(), now() as current_time')
  }

  async getDatabaseInfo(): Promise<any> {
    console.log('Getting database information...')
    return await this.query('SHOW DATABASES')
  }

  async getTablesList(): Promise<any> {
    console.log('Getting tables list...')
    return await this.query(`SHOW TABLES FROM ${this.config.database}`)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Loading ClickHouse configuration...')
    
    // Load configuration from environment variables
    const config: ClickHouseConfig = {
      url: Deno.env.get('CLICKHOUSE_URL') || 'localhost',
      protocol: Deno.env.get('CLICKHOUSE_PROTOCOL') || 'http',
      port: parseInt(Deno.env.get('CLICKHOUSE_PORT') || '8123'),
      user: Deno.env.get('CLICKHOUSE_USER') || 'default',
      password: Deno.env.get('CLICKHOUSE_PASSWORD') || '',
      database: Deno.env.get('CLICKHOUSE_DATABASE') || 'default',
      timeout: parseInt(Deno.env.get('CLICKHOUSE_TIMEOUT') || '30'),
      maxRetries: parseInt(Deno.env.get('CLICKHOUSE_MAX_RETRIES') || '3'),
      sslEnabled: Deno.env.get('CLICKHOUSE_SSL_ENABLED') === 'true',
      apiKey: Deno.env.get('CLICKHOUSE_API_KEY') || '',
      adminUser: Deno.env.get('CLICKHOUSE_ADMIN_USER') || 'admin',
      adminPassword: Deno.env.get('CLICKHOUSE_ADMIN_PASSWORD') || 'Demo4test'
    }

    console.log('ClickHouse configuration loaded:', {
      url: config.url,
      port: config.port,
      protocol: config.protocol,
      database: config.database,
      user: config.user,
      adminUser: config.adminUser,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      sslEnabled: config.sslEnabled
    })

    const { action, query, useAdmin } = await req.json()
    const client = new ClickHouseClient(config)

    let result
    switch (action) {
      case 'test':
        result = await client.testConnection()
        break
      
      case 'info':
        result = await client.getDatabaseInfo()
        break
      
      case 'tables':
        result = await client.getTablesList()
        break
      
      case 'query':
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter is required for custom queries' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        result = await client.query(query, useAdmin || false)
        break
      
      default:
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action. Supported actions: test, info, tables, query',
            config: {
              availableActions: ['test', 'info', 'tables', 'query'],
              defaultCredentials: {
                adminUser: config.adminUser,
                regularUser: config.user
              },
              connectionInfo: {
                url: config.url,
                port: config.port,
                database: config.database,
                sslEnabled: config.sslEnabled
              }
            }
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        config: {
          url: config.url,
          port: config.port,
          database: config.database,
          adminUser: config.adminUser
        },
        result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ClickHouse function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})