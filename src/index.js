const express = require('express');
require('./db/mongoose');
const userRouter = require('./routes/user')
const taskRouter = require('./routes/task')

const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(userRouter)
app.use(taskRouter)
 
// Start the server
app.listen(port, () => {
    console.log('Server is up on port ' + port);
});



