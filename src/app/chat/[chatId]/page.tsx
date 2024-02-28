import ChatCompnent from "@/components/ChatCompnent";
import ChatSideBar from "@/components/ChatSideBar";
import PdfViewer from "@/components/PdfViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const isPro = await checkSubscription();

  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  //   if (!_chats) {
  //     return redirect("/");
  //   }

  //   if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
  //     return redirect("/");
  //   }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  return (
    <div className="flex max-h-screen">
      <div className="flex w-full max-h-screen">
        {/* Chat side bar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chatId={+chatId} chats={_chats} isPro={isPro} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 flex-[5]">
          <PdfViewer pdf_url={currentChat?.pdfUrl || ''} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatCompnent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
