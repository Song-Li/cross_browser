root = exports ? this

root.killCookie = killCookie = () ->
  Cookies.set 'machine_fingerprinting_userid', 1,
          expires: new Date(2000, 1, 1)

$ ->
  url = document.URL
  parser = document.createElement('a')
  parser.href = url
  commands = parser.search
  requests = {}
  if commands
    for c in commands.slice(1).split('&')
      seq = c.split('=')
      requests[seq[0]] = seq[1]

  root.requests = requests

  if requests['killCookie']? and requests['killCookie'] is 'true'
    killCookie()
