import app from "./app.js";
import  connectDB  from './db/db.js';

const PORT=3000;

connectDB()

app.listen(PORT,()=>{

    console.log(`server is running on port ${PORT}`);
    
})

