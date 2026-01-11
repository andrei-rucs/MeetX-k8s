import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MapPin, Phone, Mail, Loader2, Check } from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";
import { ContactFormAddDTO, RequestResponse } from "../../../../openapi/requests/types.gen";
import { useContactFormServicePostApiContactFormAddContactForm } from "../../../../openapi/queries/queries";
import { ApiError } from "../../../../openapi/requests/core/ApiError";
import { useState } from "react";

const contactFormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required"
    })
    .min(2, {
      message: "Name must be at least 2 characters",
    }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .refine((value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value ?? ""), 'Email is not valid!'),
  message: z
    .string({
      required_error: "Message is required"
    })
    .min(2, {
      message: "Message must be at least 1 characters",
    })
});

const Section6 = () => {
  const [clicked, setClicked] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    },
  })

  const { mutate, isPending } = useContactFormServicePostApiContactFormAddContactForm({
    onError: (error: ApiError) => {
      const body: RequestResponse = error.body as RequestResponse;
      setClicked(false);
      if (body.errorMessage?.code === "WrongName") {
        form.setError('name', { type: 'custom', message: body.errorMessage?.message || error.message });
      } else if (body.errorMessage?.code === "WrongEmail") {
        form.setError('email', { type: 'custom', message: body.errorMessage?.message || error.message });
      } else {
        form.setError('message', { type: 'custom', message: body.errorMessage?.message || error.message });
      }
    },
    onSuccess: () => {
      setClicked(true);
      setSuccess(true);
    }
  });

  const handleSubmit = (contact: { name: string, email: string, message: string }) => {
    const name = contact.name;
    const email = contact.email;
    const message = contact.message;
    const addContactData: ContactFormAddDTO = {
      name,
      email,
      message
    };
    const dataToSend = {
      requestBody: addContactData
    };
    mutate(dataToSend);
  };

  return (
    <div id="contact" className="w-full h-fit flex justify-center items-center flex-col p-5 box-border pt-12 pb-20 gap-3 max-w-[1500px]">
      <div className="text-white text-3xl sm:text-4xl
            md:text-5xl xl:text-6xl font-semibold mb-5">Contact Us</div>
      <div className="text-white text-lg sm:text-xl md:text-2xl font-light md:mb-3">
        Let's Start a Conversation
      </div>
      <div className="flex w-full h-fit justify-center items-center gap-8 flex-wrap gap-y-16 p-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-2 gap-4 max-w-sm w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input maxLength={255} placeholder="Name" className="bg-white text-stone-900" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-700" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input maxLength={255} placeholder="Email" className="bg-white text-stone-900" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-700" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormControl>
                    <Textarea maxLength={4095} placeholder="Your message" {...field} className="h-40 resize-none bg-white text-stone-900"></Textarea>
                  </FormControl>
                  <FormMessage className="text-red-700" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={clicked ? true : false} className={success ? "col-span-2 px-3 bg-green-500 hover:bg-green-500" : "col-span-2 px-3 bg-white hover:bg-[#ffffffaa] text-black"}>
              {isPending ? <Loader2 className="animate-spin h-4 w-4 text-black"></Loader2> :
                success ? <Check className="h-4 w-4" /> :
                  "Submit"}
            </Button>
          </form>
        </Form>
        <div className="flex justify-center gap-4 sm:gap-7 md:gap-10 max-w-sm w-full">
          <div className="flex flex-col gap-10">
            <MapPin color="white"></MapPin>
            <Phone color="white"></Phone>
            <Mail color="white"></Mail>
          </div >
          <div className="flex flex-col gap-10">
            <div className="text-white">Splaiul Independenței 313, București</div>
            <div className="text-white">021 402 9179</div>
            <div className="text-white">meetx@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section6;