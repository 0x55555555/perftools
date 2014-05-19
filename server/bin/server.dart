import 'dart:io';
import 'dart:convert';
import 'package:http_server/http_server.dart';

class PerfServer
{
  PerfServer()
  {
    _ready = false;
  }
  
  void bind(int port)
  {
    HttpServer.bind('0.0.0.0', port).then((HttpServer server) 
      {
        _ready = true;
        print('listening...');
        server.listen((HttpRequest req) 
          {
            if (req.uri.path == '/submit' && req.method == 'POST') 
            {
              onResultsSubmitted(req);
            }
          }
        );
      }
    );
  }

  void onResultsSubmitted(HttpRequest req) {
    print('received submit from ${req.connectionInfo.remoteAddress}:${req.connectionInfo.remotePort}');
    
    HttpBodyHandler.processRequest(req).then((HttpBody body) 
      {
        String str = body.body['data'];
        var data = null;
        if (str != null)
        {
          data = JSON.decode(body.body['data']);
        }
 
        var result = submitResults(data);
        
        req.response
          ..headers.add('Access-Control-Allow-Origin', '*')
          ..headers.add('Content-Type', 'text/plain')
          ..statusCode = 201
          ..write(result.toString())
          ..close();
      }
    );
  }
  
  dynamic submitResults(dynamic data)
  {
    return { 'result': 'success' };
  }

  
  bool _ready;
}

main() {
  PerfServer s = new PerfServer();
  s.bind(8888);
}
