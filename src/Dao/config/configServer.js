import mongoose from "mongoose";
const URI ="mongodb+srv://lexsa21:bFa9fwQoMry9znaJ@dbcluster.ke2nyoo.mongodb.net/db_ecommerce?retryWrites=true&w=majority&appName=dbCluster"

const connectToDB = () => {
    try {
        mongoose.connect(URI)
        console.log('connected to DB ecommerce')
    } catch (error) {
        console.log(error);
    }
};

export default connectToDB