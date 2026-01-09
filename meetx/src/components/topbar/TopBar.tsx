import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { ModeToggle } from '../themes/mode-toggle';

function TopBar() {
  const [pressed, setPressed] = useState(0);

  const scrollToDestinations = (id: string, aux: number) => {
    const myDiv = document.getElementById(id);
    if (typeof myDiv !== 'undefined' && myDiv !== null) {
      myDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = myDiv.getBoundingClientRect();
      const offset = rect.top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      if (aux === 1) {
        setPressed(0);
      }
    }
  };

  function handleClickOptions() {
    if (pressed === 1) {
      setPressed(0);
    } else {
      setPressed(1);
    }
  }

  function refreshPage() {
    window.location.reload();
  }

  return (
    <div className="flex w-full h-fit fixed justify-between items-center z-[2000] top-0 box-border px-5 py-[10px] shadow-[0_10px_30px_rgba(155,112,212,0.251)]">
      <div className="w-full h-full absolute top-0 left-0 -z-[1] backdrop-blur-sm"></div>
      <div onClick={refreshPage} className="text-white text-3xl transition-opacity duration-500 hover:opacity-70 hover:cursor-pointer">MeetX</div>
      <div className="hidden justify-between w-[300px] sm:flex md:w-[400px]">
        <div onClick={() => scrollToDestinations("section1", 0)} className="text-white text-lg p-[10px] box-border rounded-[10px] hover:bg-[#00000035] hover:cursor-pointer transition-all duration-500">Home</div>
        <div onClick={() => scrollToDestinations("features", 0)} className="text-white text-lg p-[10px] box-border rounded-[10px] hover:bg-[#00000035] hover:cursor-pointer transition-all duration-500">Features</div>
        <div onClick={() => scrollToDestinations("aboutus", 0)} className="text-white text-lg p-[10px] box-border rounded-[10px] hover:bg-[#00000035] hover:cursor-pointer transition-all duration-500">About Us</div>
      </div>
      <Button
        onClick={() => window.location.href = `${import.meta.env.VITE_AUTH_URL}/login`}
        className='hidden bg-white text-purple-700 hover:bg-purple-700 hover:text-white sm:flex'
      >
        Sign In
      </Button>
      <div className="flex flex-col justify-around items-center h-[50px] m-[5px] sm:hidden" onClick={handleClickOptions}>
        <div className={pressed === 1 ? "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300 translate-y-[12.4px] rotate-45" : "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300"}></div>
        <div className={pressed === 1 ? "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300 hidden" : "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300"}></div>
        <div className={pressed === 1 ? "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300 -translate-y-[12.4px] -rotate-45" : "w-[40px] h-[3px] bg-white rounded-[50px] transition-all duration-300"}></div>
      </div>
      <div className={pressed === 1 ? "fixed w-full h-fit top-0 left-0 -z-[1] box-border p-[30px] pt-[110px] flex flex-col gap-[5px]" : "hidden"}>
        <div className="absolute top-0 left-0 h-full w-full backdrop-blur-[30px] bg-[rgba(0,0,0,0.5)] -z-[1]"></div>
        <div onClick={() => scrollToDestinations("section1", 1)} className="text-white text-xl font-light">Home</div>
        <div className="w-full h-[2px] bg-white"></div>
        <div onClick={() => scrollToDestinations("features", 1)} className="text-white text-xl font-light">Features</div>
        <div className="w-full h-[2px] bg-white"></div>
        <div onClick={() => scrollToDestinations("aboutus", 1)} className="text-white text-xl font-light">About Us</div>
        <div className="w-full h-[2px] bg-white"></div>
        <div
          onClick={() => window.location.href = `${import.meta.env.VITE_AUTH_URL}/login`}
          className="text-white text-xl font-light cursor-pointer"
        >
          Login
        </div>
      </div>
    </div>
  );
}

export default TopBar;