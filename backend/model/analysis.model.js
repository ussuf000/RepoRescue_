import mongoose      from 'mongoose'

const analysisSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        requried:true
    },
    errorMessage:{
        type:String,
        required:true,
        trim:true,
    },
    errorType:{
        type:String,
        required:true
    },
    rootCause:{
        type:String,
        required:true
    },
    solution:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const AnalysisModel=mongoose.model('Analysis',analysisSchema);

export default AnalysisModel;