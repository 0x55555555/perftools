#!/Applications/dart/dart-sdk/bin/dart
library perf_server;
import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'dart:isolate';
import 'dart:mirrors';
import 'package:http_server/http_server.dart';
import 'package:args/args.dart' as Args;
import 'package:path/path.dart';
import 'recipe.dart';
import 'result_processor.dart';
import 'utils.dart';

final String perfIndexUrl = '/perfindex';

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

    _web = new VirtualDirectory(serverLocation + "/../web/");
    _web.jailRoot = false;
    _web.followLinks = true;
    _web.allowDirectoryListing = true;
    _web.directoryHandler = (Directory d, HttpRequest r)
      {
        _web.serveFile(new File(d.path + "/index.html"), r);
      };
  }
  
  void bind(int port)
  {
    HttpServer.bind('0.0.0.0', port).then((HttpServer server) 
      {
        _ready = true;
        print('listening...');
        server.listen((HttpRequest req) 
          {
            print(req.uri.path);
            if (req.uri.path == '/submit' && req.method == 'POST') 
            {
              onResultsSubmitted(req);
            }
            else if(req.uri.path.startsWith(perfIndexUrl))
            {
              onServeResults(req);
            }
            else
            {
              _web.serveRequest(req);
            }
          }
        );
      }
    );
  }
  
  void onServeResults(HttpRequest req)
  {
    if (req.uri.path == perfIndexUrl)
    {
      findResults().then((Map m)
        {
          req.response
            ..write(JSON.encode(m))
            ..close();
        }
      );
    }
  }
  
  Future<Map> findResults()
  {
    Completer c = new Completer();

    Map m = { };
    
    
    var recipesPath = _db + "/recipes/";

    listDirectories(recipesPath).then((List<String> recipes)
      {
        var futures = [];
      
        for (var recipe in recipes)
        {
          var recipePath = "$recipesPath/$recipe";
          var fut = listDirectories(recipePath);

          Map recipeNames = { };
          m[recipe] = recipeNames;
        
          futures.add(fut.then((List<String> recipeOutputs)
            {
              var futures = [];
              for (var recipeName in recipeOutputs)
              {
                Map branchNames = { };
                recipeNames[recipeName] = branchNames;
                
                var fut = listDirectories("$recipePath/$recipeName/branches/");
                
                futures.add(fut.then((List<String> branches)
                  {
                    for (var branch in branches)
                    {
                      branchNames[branch] = pathForBranch(recipe, recipeName, branch);
                    }
                  }
                ));
              }
              
              print(futures);
              return Future.wait(futures);
            }
          ));
        }
        
        return Future.wait(futures);
      }
    ).then((f)
      {
      c.complete(m);
      }
    );
    
    return c.future;
  }
  
  Future<List<String>> listDirectories(String path)
  {
    Completer c = new Completer();
    
    List result = [];
    
    new Directory(path).list().listen((FileSystemEntity f)
      {
        String branch = basename(f.path);
        if (branch.startsWith(".") || f is! Directory)
        {
          return;
        }
        
        result.add(branch);
      },
      onDone: ()
      {
        c.complete(result);
      }
    );
    
    return c.future;
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
    
    return _recipes.find(recipe).then((Recipe r) => storeResults(r, data, src));
  }
  
  Future<dynamic> storeResults(Recipe recipe, Map data, String src)
  {
    String branch = data['branch'];
    String identity = data['identity'];
    
    String branchSafe = branch.replaceAll(new RegExp(r'[^A-Za-z0-9]'), '_');
    
    String id = hash(src);

    var response = new ReceivePort();
    return Isolate.spawnUri(
        recipe.sourceUri,
        [ src ],
        response.sendPort)
      .then(
        (Isolate i) 
        {
          Completer c = new Completer();
          response.listen((ProcessorResult r)
            {
              String name = r.name;
              String dir = "${recipe.container}/${name}/branches/${branchSafe}/${identity}";
              File file = new File("${dir}/${id}.json");

              return file.exists().then((bool exists)
                {
                  if (exists)
                  {
                    print("skipped existing entry $id");
                    c.complete({ 'result': 'existing', 'path': pathForBranch(recipe.name, name, branchSafe) });
                    return;
                  }
                  
                  new Directory(dir)
                    .create(recursive: true)
                    .then((Directory d)
                      {
                        String out = r.toJson();
                        new File("${dir}/${id}.json").writeAsString(out);
                      }
                    );

                  print("successfully created entry $id");
                  c.complete({ 'result': 'success', 'path': pathForBranch(recipe.name, name, branchSafe) });
                }
              );
            }
          );
          
          return c.future;
        }, 
        onError: (e)
        {
          print("erorr adding result: $e");
          return { 'result': 'error', 'error': e };
        }
    );
  }
  
  String pathForBranch(String recipe, String recipeName, String branch)
  {
    return "$perfIndexUrl/$recipe/$recipeName/branches/$branch";
  }

  RecipeManager _recipes;
  String _db;
  String _serverLocation;
  bool _ready;
  StreamController _created = new StreamController();
  VirtualDirectory _web;
}

main(List<String> args)
{
  Args.ArgParser parser = new Args.ArgParser();
  Args.ArgParser command = parser.addCommand('serve');
  parser.addCommand('help');

  command.addOption('port', abbr: 'p', help: 'port to serve on', defaultsTo: '8080');
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
