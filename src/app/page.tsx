"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  archiveMediaItem,
  deleteMediaItem,
  favoriteMediaItem,
  listMediaItems,
  MediaItem,
} from "@/services/google-photos";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trash2, Archive, ChevronRight } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useSwipeable } from "react-swipeable";

export default function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      try {
        if (user) {
          const items = await listMediaItems();
          setMediaItems(items);
        }
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast({
          title: "Error",
          description: "Failed to fetch photos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, [user, toast]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipeLeft(),
    onSwipedRight: () => handleSwipeRight(),
    onSwipedUp: () => handleSwipeUp(),
    onSwipedDown: () => handleSwipeDown(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleSwipeLeft = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await deleteMediaItem(mediaItems[currentIndex].id);
      toast({
        title: "Photo deleted",
        description: "The photo has been moved to trash",
      });
      // Remove the item from the local state
      setMediaItems(items => items.filter((_, index) => index !== currentIndex));
    } catch (error) {
      console.error("Error deleting media item:", error);
      toast({
        title: "Error",
        description: "Failed to delete the photo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < mediaItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await favoriteMediaItem(mediaItems[currentIndex].id);
      toast({
        title: "Photo favorited",
        description: "The photo has been added to favorites",
      });
    } catch (error) {
      console.error("Error favoriting media item:", error);
      toast({
        title: "Error",
        description: "Failed to favorite the photo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeDown = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await archiveMediaItem(mediaItems[currentIndex].id);
      toast({
        title: "Photo archived",
        description: "The photo has been archived",
      });
    } catch (error) {
      console.error("Error archiving media item:", error);
      toast({
        title: "Error",
        description: "Failed to archive the photo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentMediaItem = mediaItems[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">PicSwipe</h1>
      {user ? (
        <>
          <p className="mb-4">Welcome, {user.displayName}!</p>
          {loading ? (
            <div className="flex items-center justify-center w-full h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : currentMediaItem ? (
            <div {...handlers} className="w-full max-w-md">
              <Card className="relative group">
                <CardContent className="p-0 overflow-hidden rounded-lg">
                  <img
                    src={currentMediaItem.baseUrl}
                    alt={`Photo ${currentIndex + 1}`}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwipeLeft}
                        disabled={loading}
                        className="text-white hover:bg-red-500/20"
                      >
                        <Trash2 className="h-6 w-6" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwipeDown}
                        disabled={loading}
                        className="text-white hover:bg-blue-500/20"
                      >
                        <Archive className="h-6 w-6" />
                        <span className="sr-only">Archive</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwipeUp}
                        disabled={loading}
                        className="text-white hover:bg-pink-500/20"
                      >
                        <Heart className="h-6 w-6" />
                        <span className="sr-only">Favorite</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwipeRight}
                        disabled={loading || currentIndex >= mediaItems.length - 1}
                        className="text-white hover:bg-green-500/20"
                      >
                        <ChevronRight className="h-6 w-6" />
                        <span className="sr-only">Next</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Photo {currentIndex + 1} of {mediaItems.length}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No photos available.</p>
          )}
          <div className="mt-8">
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <Button onClick={signInWithGoogle}>Login with Google</Button>
        </div>
      )}
    </div>
  );
}
