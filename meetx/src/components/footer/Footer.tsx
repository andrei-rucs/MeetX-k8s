import { Facebook, Github, Instagram } from "lucide-react";
import { Button } from "../ui/button";


const Footer = () => {
    const scrollToDestinations = (id: string) => {
        const myDiv = document.getElementById(id);
        if (typeof myDiv !== 'undefined' && myDiv !== null) {
            myDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const rect = myDiv.getBoundingClientRect();
            const offset = rect.top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full h-fit flex items-center justify-center flex-col bg box-border gap-8 p-8 shadow-[0_-10px_30px_#9B70D440]">
            <div className="flex justify-center items-center gap-5">
                <a href="https://www.facebook.com">
                    <Facebook className="h-10 w-10 text-white hover:cursor-pointer hover:text-[#ffffffaa] transition-all"></Facebook>
                </a>
                <a href="https://www.instagram.com">
                    <Instagram className="h-10 w-10 text-white hover:cursor-pointer hover:text-[#ffffffaa] transition-all"></Instagram>
                </a>
                <a href="https://github.com">
                    <Github className="h-10 w-10 text-white hover:cursor-pointer hover:text-[#ffffffaa] transition-all"></Github>
                </a>
            </div>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <Button onClick={() => scrollToDestinations("section1")} variant="ghost" className="text-white">Home</Button>
                <Button onClick={() => scrollToDestinations("features")} variant="ghost" className="text-white">Features</Button>
                <Button onClick={() => scrollToDestinations("aboutus")} variant="ghost" className="text-white">About Us</Button>
                <Button onClick={() => scrollToDestinations("contact")} variant="ghost" className="text-white">Contact</Button>
            </div>
            <div className="text-white">
                Copyright@2024
            </div>
        </div>);
}

export default Footer;