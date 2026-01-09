import message from "./img/message.svg"
import like from "./img/like.svg"
import { Parallax } from "react-scroll-parallax";
import { useEffect, useState } from "react";

const Section1 = (props: { disableParallax: boolean }) => {
    const [bottomScroll, setTopScrollCard] = useState(0);

    const getScrollValue = (id: string) => {
        const myDiv = document.getElementById(id);
        if (myDiv) {
            const rect = myDiv.getBoundingClientRect();
            setTopScrollCard(rect.bottom);
        }
        return 0;
    };

    useEffect(() => {
        getScrollValue("section1");
    }, []);

    return (
        <div id="section1" className="w-full max-w-[1500px] h-screen min-h-[500px] sm:min-h-[600px] max-h-[1000px] flex justify-center
    items-center flex-col pt-20 overflow-hidden">
            <Parallax disabled={props.disableParallax} startScroll={0}
                endScroll={bottomScroll} translateX={['0px', '-1000px']}>
                <p className="font-extrabold text 
            bg-cover leading-none text-[calc(10vw+1rem)] sm:text-[5rem]
            md:text-[6rem] lg:text-[9rem]">
                    Team chat
                </p>
            </Parallax>
            <Parallax disabled={props.disableParallax} startScroll={0}
                endScroll={bottomScroll} translateX={['0px', '1000px']}>
                <p className="font-extrabold text bg-cover leading-none
            text-[calc(10vw+1rem)] sm:text-[5rem] md:text-[6rem]
            lg:text-[9rem] pb-5">
                    Reimagined
                </p>
            </Parallax>
            <p className="text-center w-3/4 sm:w-3/5 md:w-3/6 text-[0.7rem]
        sm:text-[0.8rem] md:text-[0.9rem] lg:text-[1rem] text-slate-600 mt-7">
                At <span className="text-purple-700">MeetX</span>, our platform
                facilitates seamless collaboration among
                professionals in the same field, enabling easy communication,
                knowledge sharing, and collective advancement.
            </p>
            <div className="flex justify-between w-full px-10 sm:px-20 md:px-40 mt-[20px] sm:mt-0">
                <Parallax disabled={props.disableParallax} startScroll={0}
                    endScroll={bottomScroll} translateX={['0px', '-300px']} rotate={[0, -90]}>
                    <img className="w-[55px] sm-[80px] md:w-[96px]
                aspect-square -rotate-12" src={message} loading="lazy" />
                </Parallax>
                <button
                    onClick={() => window.location.href = `${import.meta.env.VITE_AUTH_URL}/register`}
                    className="w-[130px] aspect-[3] font-semibold text-white
                cursor-pointer text-center border-none transition-all duration-500
                hover:transition-all hover:duration-500 rounded-[50px] focus:outline-none
                bg-[length:300%_100%] hover:bg-right-top bg-gradient-to-r
                from-[#ED5681] via-[#9B70D4] to-[#59D3D2]
                shadow-[0_10px_30px_rgba(155,112,212,0.376)] mt-10
                sm:w-[160px] text-[17px] sm:text-[20px]">
                    Sign Up
                </button>
                <Parallax disabled={props.disableParallax} startScroll={0}
                    endScroll={bottomScroll} translateX={['0px', '300px']} rotate={[0, 90]}>
                    <img className="w-[55px] sm-[80px] md:w-[96px]
                aspect-square rotate-12" src={like} loading="lazy"></img>
                </Parallax>
            </div>
        </div>);
}

export default Section1;