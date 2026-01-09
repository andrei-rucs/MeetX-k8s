import { cn } from "@/lib/utils"
import { UserDTO } from "../../../openapi/requests/types.gen";


const UserAvatar = (props: {user?: UserDTO, className: String, status: "hidden" | "visible"}) => {
    const className = "w-[20%] h-[20%] rounded-full absolute right-[8%] bottom-[8%] "
    return (
    <div className={cn("relative", props.className)}>
        {props.user?.avatarPath === null || props.user?.avatarPath === "" ?
            <div className="w-full h-full rounded-full flex justify-center items-center text-[1.5em]" style={{backgroundColor: "" + props.user?.color}}>
                <p className='text-[1em] text-white'>{props.user?.shortName}</p>
            </div> :
            <img className='w-full h-full rounded-full' src={`${import.meta.env.VITE_BACKEND_URL}/${props.user?.id}/Avatar/${props.user?.avatarPath}`}></img>}
        {
            props.status === "visible" && props.user?.status ?
            <>
                <div className="w-[36%] h-[36%]
                bg-[rgb(119,125,141)] dark:bg-[#171b25]
                rounded-full absolute right-0 bottom-0
                group-hover:bg-neutral-600 transition-colors"/>
                <div className={className + (true ? "bg-green-600" : "bg-neutral-400")}/>
            </> :
            null
        }
    </div> );
}
 
export default UserAvatar;