"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, Alert01Icon } from "@hugeicons/core-free-icons";

import { deleteAccount } from "./actions";

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border border-rose-100 text-rose-600 text-[13px] font-semibold hover:bg-rose-50 transition-colors"
      >
        <HugeiconsIcon icon={Delete01Icon} size={14} color="currentColor" />
        Delete account
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={Alert01Icon} size={16} color="#e11d48" />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-rose-900">
            Delete account permanently?
          </p>
          <p className="text-[12px] text-rose-700 mt-0.5">
            Your profile, orders, coins, and history will be removed. This
            can&rsquo;t be undone.
          </p>
        </div>
      </div>
      <form action={deleteAccount} className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="flex-1 h-10 rounded-full bg-white text-zinc-900 text-[13px] font-semibold border border-zinc-200"
        >
          Cancel
        </button>
        <ConfirmButton />
      </form>
    </div>
  );
}

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 h-10 rounded-full bg-rose-600 text-white text-[13px] font-semibold disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}
