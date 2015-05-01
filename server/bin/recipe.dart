library perf_recipe;
import 'utils.dart';
import 'dart:core';
import 'dart:async';
import 'dart:io';

class Recipe
{
  Recipe(String this._name, String path, String this._container, bool this._existing)
  {
    _sourceUri = Uri.parse(path);  
  }

  String get name => _name;
  String get container => _container;
  bool get existing => _existing;
  Uri get sourceUri => _sourceUri;
  
  String _name;
  String _container;
  bool _existing;
  Uri _sourceUri;
}

class RecipeManager
{
  RecipeManager(String this._serverLocation, String this._db)
  {
  }
  
  Future<Recipe> find(String recipe)
  {
    if (recipe == null || recipe.length > 0)
    {
      Completer c = new Completer();
       
      String path = recipePath('default');
      new Directory(path).create(recursive: true).then((Directory d)
        {
          c.complete(new Recipe('default', 'default_recipe.dart', path, true));
        }
      );
       
      return c.future;
    }
    else
    {
      String recipeHash = hash(recipe);
       
      Directory location = new Directory(recipePath(recipeHash));
       
      return location.exists()
        .then((bool exists)
          {
          if (!exists)
            {
            return _createRecipe(recipeHash, location, recipe);
            }
          
          return _loadRecipe(recipeHash);
        }
      );
    }
  }
  
  Future<Recipe> _createRecipe(String hash, Directory dir, String recipe)
  {
    return dir.create(recursive: true).then((Directory d)
      {
      final String recipePrefix = '''
import "${_serverLocation}/result_processor.dart";

class TheCooker extends Cooker {
''';
      final String recipeSuffix = '''
}

void main(args, replyTo) => Processor.start(args, replyTo, new TheCooker());''';

      String contents = recipePrefix + recipe + recipeSuffix;
      
      return new File(recipeDartPath(hash))
        .writeAsString(contents, flush: true)
        .then((File f)
          {
          return _loadRecipe(hash, false);
          }
        );
      }
    );
  }
  
  Future<Recipe> _loadRecipe(String hash, [ bool existing = true ])
  {
    Completer c = new Completer();
    
    String recipe = recipePath(hash);
    
    c.complete(new Recipe(hash, recipeDartPath(hash), recipe, existing));
    
    return c.future;
  }

  
  String recipePath(String hash)
  {
    return "${_db}/recipes/$hash";
  }
  
  String recipeDartPath(String hash)
  {
    return "${recipePath(hash)}/recipe.dart";
  }

  String _db;
  String _serverLocation;
}