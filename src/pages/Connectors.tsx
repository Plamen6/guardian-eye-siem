{/* Previous imports remain the same */}

    {/* In the ConnectorEditor component, update the Select components: */}
    {/* File parser hint select */}
    <Select 
      value={formData.parser_hint} 
      onValueChange={(value) => setFormData({...formData, parser_hint: value})}
    >
      <SelectTrigger>
        <SelectValue placeholder="Auto-detect format" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto-detect</SelectItem>
        <SelectItem value="json">JSON</SelectItem>
        <SelectItem value="syslog">Syslog</SelectItem>
        <SelectItem value="apache">Apache</SelectItem>
        <SelectItem value="nginx">Nginx</SelectItem>
        <SelectItem value="csv">CSV</SelectItem>
      </SelectContent>
    </Select>

    {/* Syslog format select */}
    <Select 
      value={formData.format} 
      onValueChange={(value: 'auto' | 'rfc3164' | 'rfc5424') => setFormData({...formData, format: value})}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto-detect</SelectItem>
        <SelectItem value="rfc3164">RFC 3164 (Legacy)</SelectItem>
        <SelectItem value="rfc5424">RFC 5424 (Modern)</SelectItem>
      </SelectContent>
    </Select>

    {/* Connector type select */}
    <Select 
      value={formData.type} 
      onValueChange={(value: 'file_tail' | 'syslog_udp' | 'syslog_tcp') => setFormData({...formData, type: value})}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="file_tail">File Tail</SelectItem>
        <SelectItem value="syslog_udp">Syslog UDP</SelectItem>
        <SelectItem value="syslog_tcp">Syslog TCP</SelectItem>
      </SelectContent>
    </Select>
