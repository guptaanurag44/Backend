const asynchandler=(requesthandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requesthandler(req,res,next)).catch((err)=>next(err))
    }
}

export{asynchandler}

// const asynchandler=()=>{}
// const asynchandler=(func)=>()={}

// const asynchandler=(fn)=>async (req,res,next)=>{
//     try{

//     }
//     catch(error){
//         res.status(error.code||500).json({
//             success:false;
//             message:error.message
//         })
//     }
// }