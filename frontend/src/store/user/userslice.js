import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        name:"",
        id:0,
        token: "",

    },
    reducers:{
        setUser: (state, action) => {
            const username = action.payload.name
            const id = action.payload.id
            const token = "Bearer "  + action.payload.token 
            state.name=username;
            state.token = token
            state.id = id;
        },

    }
})

export const { setUser } = userSlice.actions

export default userSlice.reducer