#!/Applications/dart/dart-sdk/bin/dart
import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'package:http_server/http_server.dart';
import 'package:crypto/crypto.dart' as Crypto;
import 'package:args/args.dart' as Args;

class PerfServer
{
  PerfServer(String this._db)
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
    print('received submit from ${req.connectionInfo.remoteAddress.address}:${req.connectionInfo.remotePort}');
    
    HttpBodyHandler.processRequest(req).then((HttpBody body) 
      {
        String str = body.body['data'];
        var data = null;
        if (str != null)
        {
          data = JSON.decode(str);
        }
 
        var result = submitResults(data, str);
        
        result.then((dynamic res)
          {
          req.response
            ..headers.add('Access-Control-Allow-Origin', '*')
            ..headers.add('Content-Type', 'text/plain')
            ..statusCode = 201
            ..write(res)
            ..close();
          }
        );
      }
    );
  }
  
  Future<dynamic> submitResults(dynamic data, String src)
  {
    String desc = data['identity'];
    
    String id = hash(src);
    
    return new Directory("${_db}/${desc}")
      .create()
      .then((Directory d)
        {
        new File("${_db}/${desc}/${id}.json").writeAsString(src);
        
        print("successfully created entry $id");
        return { 'result': 'success', 'id': id };
        }
      );
  }
  
  String hash(String src)
  { 
    var hash = new Crypto.SHA256();
    hash.add(src.codeUnits);
    List<int> output = hash.close();
    
    String out = "";
    output.forEach((e) => out += e.toRadixString(16));
    return out;
  }

  String _db;
  bool _ready;
  StreamController _created = new StreamController();
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
