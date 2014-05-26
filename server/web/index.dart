import 'dart:html';
import 'dart:convert';

Element index;

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
        d.children.add(p);

        DivElement children = new DivElement();
        
        expand.onClick.listen((e) => children.classes.toggle("hidden"));
        children.classes.add("hidden");
        children.classes.add("children");
        
        data.forEach((String branch, String url)
          {
          ParagraphElement child = new ParagraphElement();
          child.classes.add("branch");
          child.text = branch;
          
          children.children.add(child);
          }
        );
        
        d.children.add(children);
        
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
      indexReq.then((String result) => updateIndex(JSON.decode(result)));
    }
  );
}