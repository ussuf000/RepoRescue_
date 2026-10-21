import mongoose      from 'mongoose'

const analysisSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        index:true
    },
    errorMessage:{
        type:String,
        required:true,
        trim:true,
        maxlength:30000,
    },
    codeSnippet:{
        type:String,
        trim:true,
        maxlength:30000
    },
    language:{
        type:String,
        trim:true,
        maxlength:50
    },
    errorType:{
        type:String,
        required:true,
        maxlength:120
    },
    rootCause:{
        type:String,
        required:true,
        maxlength:20000
    },
    solution:{
        type:String,
        required:true,
        maxlength:20000
    },
    correctedCode:{
        type:String,
        trim:true,
        maxlength:50000
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project',
        default:null,
        index:true
    },
    isBookmarked:{
        type:Boolean,
        default:false,
        index:true
    }
},{
    timestamps:true
})

const AnalysisModel=mongoose.model('Analysis',analysisSchema);

export default AnalysisModel;
