import toast from "react-hot-toast";
import { base_url } from "../components/constant/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";


const useFollow = ()=>{
    const queryClient = useQueryClient()
    const {mutate : follow , isPending} = useMutation({

        mutationFn : async (userId)=>{
            try {
                const res = await fetch(`${base_url}/api/users/follow/${userId}`,{
                    method : "POST",
                    credentials : "include",
                    headers :{
                        "Content-Type" : "application/json"
                    }
                })
                const data = await res.json()
                if(!data){
                    throw new Error(data.error || "Some Thing Went Wrong")
                }
                return data
            } catch (error) {
                throw error
            }
        },
        onSuccess : ()=>{
            Promise.all([
                queryClient.invalidateQueries({queryKey:["suggestedUsers"]}),
                queryClient.invalidateQueries({queryKey:["authUser"]})
            ])
            
        },
        onError:()=>{
            toast.error(error)
        }
    })
    return {follow , isPending}
}

export default useFollow