#!/Applications/dart/dart-sdk/bin/dart
library perf_server;
import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'dart:isolate';
import 'dart:mirrors';
import 'package:http_server/http_server.dart';
import 'package:args/args.dart' as Args;
import 'recipe.dart';
import 'result_processor.dart';
import 'utils.dart';

class PerfServer
{
  PerfServer(String db)
  {
    _ready = false;
    _db = Directory.current.absolute.path + "/" + db;
    
    MirrorSystem sys = currentMirrorSystem();
    var lib = sys.findLibrary(MirrorSystem.getSymbol('perf_server'));
    var serverLocation = new File(lib.uri.path).parent.absolute.path;
    
    _recipes = new RecipeManager(serverLocation, _db);
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
        String process = body.body['process'];
        var data = null;
        if (str != null)
        {
          data = JSON.decode(str);
        }
 
        var result = submitResults(data, str, process);
        
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
  
  Future<dynamic> submitResults(Map data, String src, String process)
  {
    String recipe = data['recipe'];
    
    return _recipes.find(recipe).then((Recipe r) => storeResults(r.uri, data, src));
  }
  
  Future<dynamic> storeResults(Uri recipe, Map data, String src)
  {
    String branch = data['branch'];
    String identity = data['identity'];
    
    String branchSafe = branch.replaceAll(new RegExp(r'[^A-Za-z0-9]'), '_');
    
    String id = hash(src);
    
    String dir = "${_db}/branches/${branchSafe}/${identity}";
    File file = new File("${dir}/${id}.json");
    
    return file.exists().then((bool exists)
      {
        if (!exists)
        {
          var response = new ReceivePort();
          return Isolate.spawnUri(
              recipe,
              [ src ],
              response.sendPort)
            .then(
              (Isolate i) 
              {
                return new Directory(dir)
                  .create(recursive: true)
                  .then((Directory d)
                    {
                      response.listen((ProcessorResult r)
                        {
                          String out = r.toJson();
                          print("output is: $out");
                          new File("${dir}/${id}.json").writeAsString(out);
                        }
                      );
                  
                    print("successfully created entry $id");
                    return { 'result': 'success', 'id': id };
                    }
                  );
              }, 
              onError: (e)
              {
                print("erorr adding result: $e");
                return { 'result': 'error', 'error': e };
              }
            );
          
        }
        else
        {
          print("skipped existing result $id");
          return { 'result': 'exists', 'id': id };
        }
      }
    );
  }

  RecipeManager _recipes;
  String _db;
  String _serverLocation;
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
