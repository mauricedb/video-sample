import * as http from "http";
import * as fs from "fs";

const chunkSize = 102400;

const server = http.createServer(function (req, res) {
  console.log(req.url);

  switch (req.url) {
    case "/cat-small":
      fs.createReadStream(__dirname + "/cat-small.jpg").pipe(res);
      break;
    case "/cat-movie":
      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "cache-control": "no-cache",
      });

      fs.createReadStream(__dirname + "/cat-movie.mp4").pipe(res);
      break;

    case "/cat-movie-range":
      console.log("req.headers.range: ", req.headers.range);

      const fileName = "/cat-movie.mp4";
      //   const fileName = "/React_Rotterdam_Jan_2020_Maurice.mp4";

      const stat = fs.statSync(__dirname + fileName);
      const fileSize = stat.size;
      console.log("fileSize", fileSize);

      const re = /bytes=(\d+)-(\d*)/.exec(req.headers.range);
      const start = +(re?.[1] ?? 0);
      const end = Math.min(+(re?.[2] || start + chunkSize), fileSize - 1);
      console.log("range", start, end);

      res.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Length": start === end ? 0 : end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Type": "video/mp4",
        "cache-control": "no-cache",
      });

      fs.createReadStream(__dirname + fileName, {
        start,
        end,
      }).pipe(res);

      break;

    default:
      res.write(`Hello World! on "${req.url}"`);
      res.end();
  }
});

server.listen(8081);
