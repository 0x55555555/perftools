
def open_perf_server(name, delete_records = true)
  port = 3000
  to_kill = []
  to_root = ""
  data_dir = "#{to_root}test/data/#{name}"
  FileUtils.mkdir_p(data_dir)
  to_kill << IO.popen("mongod --dbpath #{data_dir}")
  to_kill << IO.popen("node #{to_root}node_server/server.js")

  # Wait for servers to start
  sleep(0.8)

  yield(port)

  # Wait after to allow the processes to handle request fully.
  sleep(0.5)

ensure
  to_kill.reverse.each do |p|
    pid = p.pid
    Process.kill "TERM", pid
    p.close
  end
  FileUtils.rm_rf(data_dir) if delete_records
end
