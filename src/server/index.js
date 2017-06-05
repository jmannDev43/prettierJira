import app from './app.js';
import reload from 'reload';
import http from 'http';

const PORT = process.env.PORT || 9000;

const server = http.createServer(app);

reload(server, app)

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

