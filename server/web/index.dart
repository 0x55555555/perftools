import 'dart:html';
import 'dart:convert';
import 'dart:async';

Element index;
Element graph;

void updateGraph(List<String> branches)
{
  graph.innerHtml = branches.fold("", (p, e) => p += "-" + e);
  
  Future.wait(branches.map((url) => HttpRequest.getString(url)))
    .then((List<String> contents)
      {
      graph.innerHtml = contents.fold("", (p, e) => p += "-" + e);
      }
    );
}

void updateIndex(Map indexData)
{ 
  index.children.clear();
  indexData.forEach((String recipe, Map data)
    {
      data.forEach((String id, Map data)
        {
        DivElement d = new DivElement();
        d.classes.add("recipe");
        
        ParagraphElement expand = new ParagraphElement();
        expand.text = "[+]";
        expand.classes.add("expand");
        expand.classes.add("no-selection");
        d.children.add(expand);
        
        ParagraphElement p = new ParagraphElement();
        p.text = "$recipe:$id";
        p.classes.add("title");
        p.classes.add("no-selection");
        d.children.add(p);

        DivElement children = new DivElement();
        
        expand.onClick.listen((e) => children.classes.toggle("hidden"));
        children.classes.add("hidden");
        children.classes.add("children");
        
        List<String> allUrls = [];
        
        data.forEach((String branch, String url)
          {
          ParagraphElement child = new ParagraphElement();
          child.classes.add("branch");
          child.classes.add("no-selection");
          child.text = branch;

          child.onClick.listen((e) => updateGraph([ url ]));
          
          allUrls.add(url);
        
          children.children.add(child);
          }
        );
        
        d.children.add(children);

        p.onClick.listen((e) => updateGraph(allUrls));
        
        index.children.add(d);
        }
      );
    }
  );
}

void main()
{
  var indexReq = HttpRequest.getString("/perfindex");
  
  window.onLoad.listen((e)
    {
      index = document.getElementById("perf_index");
      graph = document.getElementById("chart_view");
      indexReq.then((String result) => updateIndex(JSON.decode(result)));
    }
  );
}