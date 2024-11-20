import { useEffect } from "react";
import { useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";

export const useGuard = ()=>{
    const user = useSelector(state => state.user.id)
    const navigator = useNavigate();
    useEffect(()=>{
        if (user==0) navigator("/auth")
    },[user])
}