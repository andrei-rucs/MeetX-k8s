import {
    Card,
    CardContent,
    CardFooter
  } from "@/components/ui/card"
import { Download, Eye, File, Image } from 'lucide-react';
import { FileGetDTO } from "../../../openapi/requests/types.gen";
import { useAppSelector } from "@/application/store";
import axios from "axios";
import { useState } from "react";

const FileMessageCard = (props: {file: FileGetDTO, isGroup: boolean}) => {
    const { selectedTopicId, selectedConvId } = useAppSelector(x => x.selectedReducer);
    const [preView, setPreView] = useState<boolean>(false);

    const handleDownloadClick = () => {
        axios({
            url: props.isGroup ? `${import.meta.env.VITE_BACKEND_URL}/${selectedTopicId}/Topics/${props.file.path}` :
            `${import.meta.env.VITE_BACKEND_URL}/${selectedConvId}/Users/${props.file.path}`,
            method: 'GET',
            responseType: 'blob',
          }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', props.file && props.file.name ? props.file.name : "unknown");
            document.body.appendChild(link);
            link.click();
          });
    };

    return ( 
        <Card className="w-[140px] min-w-[140px] aspect-square flex flex-col
        justify-between items-center p-4 bg-[rgb(185,191,205)] dark:bg-[#424b60] border-0 relative">
            <Download className="absolute right-[2px] top-[2px] w-5 h-5
            text-white hover:text-green-600 hover:cursor-pointer transition-all" onClick={handleDownloadClick}>
            </Download>
            <CardContent className="w-[85%] aspect-square p-0">
                {
                    props.file.type === "Image" ?
                    ( preView ?
                    <img src={props.isGroup ? `${import.meta.env.VITE_BACKEND_URL}/${selectedTopicId}/Topics/${props.file.path}` :
                    `${import.meta.env.VITE_BACKEND_URL}/${selectedConvId}/Users/${props.file.path}`} className="w-full
                    aspect-square object-contain" loading="lazy"></img> :
                    <div className="w-full h-full relative">
                        <Image className="w-full h-full text-white"/>
                        <Eye className="text-green-600 absolute w-10 h-10 -right-1
                        -bottom-1 hover:cursor-pointer hover:text-green-400
                        transition-all fill-[rgb(185,191,205)] dark:fill-[#424b60]" onClick={() => setPreView(true)}></Eye>
                    </div>
                    ) :
                    <File className="w-full h-full text-white"/>
                }
            </CardContent>
            <CardFooter className="p-0 w-full overflow-hidden h-7">
                <p className="w-full text-sm truncate text-white">{props.file.name}</p>
            </CardFooter>
        </Card>
    );
}
 
export default FileMessageCard;