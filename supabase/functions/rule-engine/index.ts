import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SupabaseRule {
  id: string
  title: string
  type: 'sigma' | 'cel' | 'python'
  enabled: boolean
  yaml?: string
  expression?: string
  python_code?: string
  timeframe?: number
  threshold?: number
  level: 'critical' | 'high' | 'medium' | 'low' | 'informational'
  fields: string[]
  tags: string[]
}

interface SupabaseEvent {
  id: string
  timestamp: string
  event_dataset?: string
  event_action?: string
  event_outcome?: 'success' | 'failure' | 'unknown'
  source_ip?: string
  destination_ip?: string
  user_name?: string
  host_name?: string
  [key: string]: any
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, rule_id, events } = await req.json()

    switch (action) {
      case 'evaluate_rule':
        return await evaluateRule(supabaseClient, rule_id, events)
      case 'test_rule':
        return await testRule(supabaseClient, rule_id)
      case 'correlate_events':
        return await correlateEvents(supabaseClient)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in rule engine:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function evaluateRule(supabaseClient: any, ruleId: string, events: SupabaseEvent[]) {
  // Get the rule
  const { data: rule, error: ruleError } = await supabaseClient
    .from('rules')
    .select('*')
    .eq('id', ruleId)
    .single()

  if (ruleError || !rule) {
    throw new Error('Rule not found')
  }

  const results = await executeRule(rule, events)
  
  // If rule matches, create alert
  if (results.matches) {
    const alert = await createAlert(supabaseClient, rule, results.matchedEvents, results.correlation)
    return new Response(
      JSON.stringify({ 
        matches: true, 
        alert_id: alert.id,
        matched_events: results.matchedEvents.length,
        correlation: results.correlation
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ matches: false }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function testRule(supabaseClient: any, ruleId: string) {
  // Get recent events for testing (last 1000 events)
  const { data: events, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1000)

  if (error) throw new Error('Failed to fetch test events')

  return await evaluateRule(supabaseClient, ruleId, events || [])
}

async function correlateEvents(supabaseClient: any) {
  // Get all enabled rules
  const { data: rules, error: rulesError } = await supabaseClient
    .from('rules')
    .select('*')
    .eq('enabled', true)

  if (rulesError) throw new Error('Failed to fetch rules')

  // Get recent events (last 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: events, error: eventsError } = await supabaseClient
    .from('events')
    .select('*')
    .gte('timestamp', oneHourAgo)
    .order('timestamp', { ascending: false })

  if (eventsError) throw new Error('Failed to fetch events')

  const alerts = []
  
  // Evaluate each rule against the events
  for (const rule of rules || []) {
    try {
      const results = await executeRule(rule, events || [])
      if (results.matches) {
        const alert = await createAlert(supabaseClient, rule, results.matchedEvents, results.correlation)
        alerts.push(alert)
        
        // Update rule statistics
        await supabaseClient
          .from('rules')
          .update({ 
            last_triggered: new Date().toISOString(),
            trigger_count: rule.trigger_count + 1
          })
          .eq('id', rule.id)
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error)
    }
  }

  return new Response(
    JSON.stringify({ 
      processed_rules: rules?.length || 0,
      processed_events: events?.length || 0,
      alerts_generated: alerts.length,
      alerts
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function executeRule(rule: SupabaseRule, events: SupabaseEvent[]) {
  switch (rule.type) {
    case 'sigma':
      return executeSigmaRule(rule, events)
    case 'cel':
      return executeCelRule(rule, events)
    case 'python':
      return executePythonRule(rule, events)
    default:
      throw new Error(`Unsupported rule type: ${rule.type}`)
  }
}

function executeSigmaRule(rule: SupabaseRule, events: SupabaseEvent[]) {
  // Simplified Sigma rule execution
  // In a real implementation, you'd parse the YAML and execute the detection logic
  const matchedEvents = []
  const timeframe = rule.timeframe || 5 // minutes
  const threshold = rule.threshold || 1
  const cutoffTime = new Date(Date.now() - timeframe * 60 * 1000)

  // Simple pattern matching based on common Sigma patterns
  for (const event of events) {
    const eventTime = new Date(event.timestamp)
    if (eventTime < cutoffTime) continue

    // Example: SSH brute force detection
    if (rule.title.toLowerCase().includes('ssh') || rule.title.toLowerCase().includes('brute')) {
      if (event.event_dataset === 'auth' && 
          event.event_action === 'login' && 
          event.event_outcome === 'failure') {
        matchedEvents.push(event)
      }
    }
    
    // Example: DNS suspicious activity
    if (rule.title.toLowerCase().includes('dns') || rule.title.toLowerCase().includes('malicious')) {
      if (event.event_dataset === 'dns' || event.dns_question_name) {
        matchedEvents.push(event)
      }
    }
  }

  // Group by entity (e.g., source IP) and check threshold
  const entities = new Map()
  for (const event of matchedEvents) {
    const key = event.source_ip || event.user_name || event.host_name || 'unknown'
    if (!entities.has(key)) entities.set(key, [])
    entities.get(key).push(event)
  }

  // Check if any entity exceeds threshold
  for (const [entity, entityEvents] of entities) {
    if (entityEvents.length >= threshold) {
      return {
        matches: true,
        matchedEvents: entityEvents,
        correlation: {
          entity_key: entity,
          event_count: entityEvents.length,
          timeframe: `${timeframe} minutes`,
          threshold_exceeded: entityEvents.length >= threshold
        }
      }
    }
  }

  return { matches: false, matchedEvents: [], correlation: {} }
}

function executeCelRule(rule: SupabaseRule, events: SupabaseEvent[]) {
  // Simplified CEL rule execution
  const matchedEvents = []
  const expression = rule.expression || ''

  for (const event of events) {
    try {
      // Basic CEL-like expression evaluation
      if (expression.includes('event.action') && expression.includes('login')) {
        if (event.event_action === 'login') matchedEvents.push(event)
      }
      if (expression.includes('dns.question.name') && expression.includes('malicious')) {
        if (event.dns_question_name?.includes('malicious')) matchedEvents.push(event)
      }
    } catch (error) {
      console.error('CEL evaluation error:', error)
    }
  }

  return {
    matches: matchedEvents.length > 0,
    matchedEvents,
    correlation: {
      expression: expression,
      matched_count: matchedEvents.length
    }
  }
}

function executePythonRule(rule: SupabaseRule, events: SupabaseEvent[]) {
  // Simplified Python rule execution
  // In reality, you'd use a Python runtime or convert the logic
  const matchedEvents = []
  const code = rule.python_code || ''

  // Basic pattern detection for common Python correlation rules
  if (code.includes('privilege_escalation') || code.includes('sudo')) {
    const userEvents = new Map()
    
    for (const event of events) {
      const user = event.user_name
      if (!user) continue
      
      if (!userEvents.has(user)) userEvents.set(user, [])
      userEvents.get(user).push(event)
    }

    // Look for login -> sudo -> file access sequence
    for (const [user, userEventList] of userEvents) {
      const hasLogin = userEventList.some(e => e.event_action === 'login')
      const hasSudo = userEventList.some(e => e.process_name?.includes('sudo'))
      const hasFileAccess = userEventList.some(e => e.event_dataset === 'file')
      
      if (hasLogin && hasSudo && hasFileAccess) {
        matchedEvents.push(...userEventList.slice(0, 3))
      }
    }
  }

  return {
    matches: matchedEvents.length > 0,
    matchedEvents,
    correlation: {
      sequence_detected: matchedEvents.length > 0,
      user_count: new Set(matchedEvents.map(e => e.user_name)).size
    }
  }
}

async function createAlert(
  supabaseClient: any, 
  rule: SupabaseRule, 
  matchedEvents: SupabaseEvent[], 
  correlation: any
) {
  const firstEvent = matchedEvents[0]
  const lastEvent = matchedEvents[matchedEvents.length - 1]

  // Create entity keys from the matched events
  const entityKeys = []
  const entities = new Set()
  
  for (const event of matchedEvents) {
    if (event.source_ip) entities.add(`source.ip:${event.source_ip}`)
    if (event.user_name) entities.add(`user.name:${event.user_name}`)
    if (event.host_name) entities.add(`host.name:${event.host_name}`)
  }
  entityKeys.push(...Array.from(entities))

  // Insert alert
  const { data: alert, error: alertError } = await supabaseClient
    .from('alerts')
    .insert({
      rule_id: rule.id,
      rule_title: rule.title,
      severity: rule.level,
      status: 'open',
      timestamp_first: firstEvent.timestamp,
      timestamp_last: lastEvent.timestamp,
      count: matchedEvents.length,
      entity_keys: entityKeys,
      correlation_data: correlation
    })
    .select()
    .single()

  if (alertError) throw new Error('Failed to create alert')

  // Link events to alert
  const eventLinks = matchedEvents.map(event => ({
    alert_id: alert.id,
    event_id: event.id
  }))

  await supabaseClient
    .from('alert_events')
    .insert(eventLinks)

  return alert
}