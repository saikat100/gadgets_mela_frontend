"use client";
import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { api } from "../lib/api";

interface Reply {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    comment: string;
    isAdmin: boolean;
    createdAt: string;
}

interface Review {
    _id: string;
    user: {
        _id: string;
        name: string;
    };
    rating: number;
    comment: string;
    createdAt: string;
    replies?: Reply[];
}

interface ReviewListProps {
    reviews: Review[];
    onReviewUpdated?: () => void;
}

export default function ReviewList({ reviews, onReviewUpdated }: ReviewListProps) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Check user role and ID on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(api("/users/me"), {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserRole(data.role);
                    setCurrentUserId(data._id);
                })
                .catch(() => {
                    setUserRole(null);
                    setCurrentUserId(null);
                });
        }
    }, []);

    async function handleReplySubmit(reviewId: string) {
        if (!replyText.trim()) return;

        setSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Please log in to reply");

            const res = await fetch(api(`/reviews/${reviewId}/reply`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ comment: replyText }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to submit reply");
            }

            setReplyText("");
            setReplyingTo(null);
            if (onReviewUpdated) onReviewUpdated();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No reviews yet. Be the first to review this product!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review._id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="font-semibold">{review.user.name}</div>
                            <div className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Display existing replies */}
                    {review.replies && review.replies.length > 0 && (
                        <div className="ml-6 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                            {review.replies.map((reply) => (
                                <div key={reply._id} className="bg-gray-50 p-3 rounded">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">{reply.user.name}</span>
                                        {reply.isAdmin && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                                Admin
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply button for admins and review owners */}
                    {(userRole === "admin" || currentUserId === review.user._id) && (
                        <div className="mt-3">
                            {replyingTo === review._id ? (
                                <div className="ml-6 border-l-2 border-indigo-200 pl-4">
                                    {error && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm mb-2">
                                            {error}
                                        </div>
                                    )}
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write your reply..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleReplySubmit(review._id)}
                                            disabled={submitting || !replyText.trim()}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {submitting ? "Submitting..." : "Submit Reply"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReplyingTo(null);
                                                setReplyText("");
                                                setError("");
                                            }}
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setReplyingTo(review._id)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Reply
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
