const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
  const uri = mongod.getUri();
  console.log(`MongoDB successfully listening at ${uri} ...`);
  console.log('Keeping server alive exclusively for local testing!');
  
  // Keep the process running indefinitely.
  setInterval(() => {}, 1000 * 60 * 60); 
})();
