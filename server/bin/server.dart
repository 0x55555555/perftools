#!/Applications/dart/dart-sdk/bin/dart
import 'dart:io';
import 'dart:convert';
import 'package:http_server/http_server.dart';
import 'package:args/args.dart' as Args;

class PerfServer
{
  PerfServer(String db)
  {
    _ready = false;
    
    new Directory(db).create(recursive: true).then((db) => _db = db);
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
    print('received submit from ${req.connectionInfo.remoteAddress.address}:${req.connectionInfo.remotePort}');
    
    HttpBodyHandler.processRequest(req).then((HttpBody body) 
      {
        String str = body.body['data'];
        var data = null;
        if (str != null)
        {
          data = JSON.decode(str);
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
    String desc = data['description'];
    Map<String, dynamic> contexts = data['contexts'];
    contexts.forEach((k, v)
      {
      print(k);
      }
    );
    
    new Directory("${_db.path}/${desc}").create().then((Directory d)
      {
      }
    );
    
    return { 'result': 'success' };
  }

  Directory _db;
  bool _ready;
}

main(List<String> args)
{
  Args.ArgParser parser = new Args.ArgParser();
  Args.ArgParser command = parser.addCommand('serve');
  parser.addCommand('help');

  command.addOption('port', abbr: 'p', help: 'port to serve on', defaultsTo: '14663');
  command.addOption('db', help: 'location to store results', defaultsTo: '~/perfstack_db');
  
  Args.ArgResults res = parser.parse(args);
  
  if (res.command != null && res.command.name != "help")
  {
    Args.ArgResults cmd = res.command;
    String name = cmd.name;
    
    if (name == "serve")
    {
      int port = int.parse(cmd['port'], onError: (s) => 14663);

      PerfServer s = new PerfServer(cmd['db']);
      s.bind(port);
    }
  }
  else
  {
    print("perfstack server");
    parser.commands.forEach((k, v)
      {
        print ("command '$k'");
        print(v.getUsage());
        print("");
      }
    );
  }
}
