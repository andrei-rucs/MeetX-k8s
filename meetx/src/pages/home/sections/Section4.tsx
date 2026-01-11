function Section4() {

    return (
        <div id="aboutus" className="flex justify-center items-center
        flex-col w-full h-fit pb-14 sm:p-10 md:p-12 lg:px-5 gap-3 max-w-[1500px]">
            <p className="text-white text-3xl sm:text-4xl
            md:text-5xl xl:text-6xl font-semibold mb-5">
                About Us
            </p>
            <p className="text-white text-center w-4/5
            text-lg sm:text-xl md:text-2xl font-light">
                Welcome to <span className="text-purple-700">MeetX</span>,
                where the power of collaboration is just a click away.
            </p>
            <div className="w-3/4 sm:w-3/5 h-px bg-white" />
            <p className="text-center text-gray-400 w-3/4 sm:w-3/5 mb-3 text-[0.8rem]
            sm:text-sm md:text-base font-light">
                MeetX was born from my dedication to simplify the collaboration processes and
                maximize productivity. As a solo developer, I recognized the need for a
                user-friendly platform that enables seamless communication and project
                management among peers. Driven by my enthusiasm for streamlining collaboration,
                I created MeetX—a space designed to empower individuals to connect, share ideas,
                and achieve their goals effectively.
            </p>
        </div>
    );
}

export default Section4;
