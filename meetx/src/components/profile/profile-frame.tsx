import { useEffect, useState } from 'react';
import ProfileForm from './profile-form';
import { AvatarDialog } from './avatar-dialog';
import { useQuery } from '@tanstack/react-query';
import { useUserServiceGetApiUserGetMeKey } from '../../../openapi/queries/common';
import { UserService } from '../../../openapi/requests/services.gen';
import { Skeleton } from '../ui/skeleton';
import { UsersTable } from './users-table';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { setAppRole, setUserId } from '@/application/state-slices';
import { useAppDispatch } from '@/application/store';
import { fetchQuery } from '@/App';
import { ContactTable } from './contact-table';

const ProfileFrame = () => {
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [position, setPosition] = useState<string>("");
    const [imageChanged, setImageChanged] = useState<boolean>(false);
    const [imageRemoved, setImageRemoved] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const {data, status, isFetching, isLoading, dataUpdatedAt} = useQuery({
        queryKey: [useUserServiceGetApiUserGetMeKey],
        queryFn: () => {
            return fetchQuery(UserService.getApiUserGetMe(), dispatch);
        },
        retry: false
    });

    useEffect(() => {
        if (status === "success") {
            data.response?.avatarPath !== null && data.response?.avatarPath !== "" ?
                setImage(`${import.meta.env.VITE_BACKEND_URL}/${data.response?.id}/Avatar/${data.response?.avatarPath}`) :
                setImage(null);
            setEmail(data.response?.email === null || data.response?.email === undefined ? "" : data.response?.email);
            setName(data.response?.name === null || data.response?.name === undefined ? "" : data.response?.name);
            setPosition(data.response?.position === null || data.response?.position === undefined ? "" : data.response?.position)
            dispatch(setAppRole(data?.response?.role === "Admin" ? true : false));
            dispatch(setUserId(data.response?.id));
        }
    }, [data, status, dataUpdatedAt])

    return (
    <ScrollArea className='w-[calc(100%-304px)]'>
    <ScrollBar className='flex'/>
        <div className={!isFetching && (data?.response?.role === "Admin" || data?.response?.role === "Staff") ? "w-full h-fit flex justify-center items-center gap-10 p-14 flex-wrap" :  
        "w-full h-fit min-h-[100vh] flex justify-center items-center gap-10 p-14 flex-wrap"
        }>
            <div className='w-[80%] max-w-[320px] aspect-square relative'>
                {
                    isFetching ? 
                    <Skeleton className='w-full h-full rounded-full'/> :
                    <>
                        {image ?
                        <img className='w-full h-full rounded-full bg-white' src={image ? image : undefined}></img> :
                        <div className="w-full h-full rounded-full flex justify-center items-center" style={{backgroundColor: "" + data?.response?.color}}>
                            <p className='text-7xl sm:text-8xl md:text-9xl text-white'>{data?.response?.shortName}</p>
                        </div>}
                        <AvatarDialog setImage={setImage} setImageChanged={setImageChanged} setImageRemoved={setImageRemoved}/>
                    </>
                }
            </div>
            <ProfileForm position={position} name={name} email={email} image={image} imageChanged={imageChanged} imageRemoved={imageRemoved}
            isFetching={isFetching} isLoading={isLoading}/>
        </div>
        {
            data?.response?.role === "Admin" && !isFetching ?
            <div className='h-fit w-full flex justify-center items-center p-14'>
                <UsersTable/>
            </div> : null
        }
        {
            !isFetching && (data?.response?.role === "Admin" || data?.response?.role === "Staff") ?
            <div className='h-fit w-full flex justify-center items-center p-14'>
                <ContactTable/>
            </div> : null
        }
    </ScrollArea> );
}
 
export default ProfileFrame;