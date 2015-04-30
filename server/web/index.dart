import 'dart:html';
import 'dart:convert';
import 'dart:async';

import 'chart.dart';
import 'chart_data.dart';
import 'result_list.dart';

Element index;
Element graph;
InputElement perResultInput;
InputElement perBranchInput;
InputElement perMachineInput;
List<String> existingBranches;
Chart chart;

void updateGraph(List<String> branches)
{ 
  existingBranches = branches;
  bool perResult = perResultInput.checked;
  bool perBranch = perBranchInput.checked;
  bool perMachine = perMachineInput.checked;
  
  Future.wait(branches.map((url) => HttpRequest.getString(url)))
    .then((List<String> contents)
      {
        List<Future> results = [];
        for(String revs in contents)
        {
          List<String> urls = JSON.decode(revs);
          var requestedData = urls.map((url) => HttpRequest.getString(url));
          results.addAll(requestedData);
        }
        
        return results;
      }
    ).then((List<Future> data)
      {
        return Future.wait(data);
      }
    ).then((List<String> stringData)
      {
        var data = stringData.map((e) => JSON.decode(e));
        
        ResultList results = new ResultList.from(data);
        
        ChartData d = results.formatChartDataForTimes(perResult, perBranch, perMachine);

        chart.draw(d);
      }
    );
}

void updateExistingGraph()
{
  if (existingBranches != null)
  {
    updateGraph(existingBranches);
  }
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

  var charter = Chart.load();
      
  window.onLoad.listen((e)
    {
      index = document.getElementById("perf_index");
      graph = document.getElementById("chart_view");
      perBranchInput = document.getElementById("perBranch");
      perMachineInput = document.getElementById("perMachine");
      perResultInput = document.getElementById("perResult");
      indexReq.then((String result) => updateIndex(JSON.decode(result)));

      perResultInput.onChange.listen((_) => updateExistingGraph());
      perBranchInput.onChange.listen((_) => updateExistingGraph());
      perMachineInput.onChange.listen((_) => updateExistingGraph());
      
      charter.then((_)
        {
        chart = new Chart(graph, 'Perf thing', { });
        }
      );
    }
  );
}