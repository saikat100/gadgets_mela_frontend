"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { api } from "../lib/api";

interface ReviewFormProps {
    productId: string;
    orderId: string;
    onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, orderId, onReviewSubmitted }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please log in to submit a review");

            const res = await fetch(api("/reviews"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    orderId,
                    rating,
                    comment,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit review");
            }

            setComment("");
            setRating(5);
            onReviewSubmitted();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setRating(i + 1)}
                            className="focus:outline-none"
                        >
                            <Star
                                className={`w-6 h-6 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Share your experience with this product..."
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}
