library perf_utils;
import 'package:crypto/crypto.dart' as Crypto;

String hash(String src)
{ 
  var hash = new Crypto.SHA256();
  hash.add(src.codeUnits);
  List<int> output = hash.close();
  
  String out = "";
  output.forEach((e) => out += e.toRadixString(16));
  return out;
}