'use client'
import { useRouter } from "next/navigation"

export default function DeletePostButton({ postId }) {
    const router = useRouter()

    async function handleClick() {
        try {
            await fetch(`/api/post/${postId}`, {
                method: 'DELETE'

            })
            router.refresh
        } catch (err) {
            console.error(err)
        }

    }

    return (
        <button onClick={handleClick}>DeletePost</button>
    )
}