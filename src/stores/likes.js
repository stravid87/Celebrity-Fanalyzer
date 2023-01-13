import { collection, deleteDoc, doc, getCountFromServer, getDoc, setDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { db } from 'src/firebase'
import { useUserStore } from 'src/stores'

export const useLikeStore = defineStore('likes', {
  state: () => ({
    _isLoading: false,
    _likes: 0,
    _dislikes: 0
  }),

  getters: {
    isLoading: (state) => state._isLoading,
    getLikes: (state) => state._likes,
    getDislikes: (state) => state._dislikes
  },

  actions: {
    async countPromptLikes(promptId) {
      const likesCollection = collection(db, 'prompts', promptId, 'likes')
      const dislikesCollection = collection(db, 'prompts', promptId, 'dislikes')

      const snapshot = await getCountFromServer(likesCollection)
      const dislikesSnapshot = await getCountFromServer(dislikesCollection)

      this._likes = snapshot.data().count
      this._dislikes = dislikesSnapshot.data().count

      return {
        likes: this._likes,
        dislikes: this._dislikes
      }
    },

    async likePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      await setDoc(doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._likes++

      // Check if the same browserId exists in dislikes collection. If true, remove the current Dislike from there
      const dislikesRef = doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId)
      const dislikesSnap = await getDoc(dislikesRef)

      if (dislikesSnap.exists()) {
        await deleteDoc(dislikesRef)
        this._dislikes--
      }

      this.countPromptLikes(promptId)
    },

    async dislikePrompt(promptId) {
      const userStore = useUserStore()
      await userStore.loadBrowserId()

      await setDoc(doc(db, 'prompts', promptId, 'dislikes', userStore.getBrowserId), {
        author: userStore.getUserRef,
        createdAt: Date.now()
      })
      this._dislikes++

      // Check if the same browserId exists in likes collection. If true, remove the current like from there
      const likesRef = doc(db, 'prompts', promptId, 'likes', userStore.getBrowserId)
      const likesSnap = await getDoc(likesRef)

      if (likesSnap.exists()) {
        await deleteDoc(likesRef)
        this._likes--
      }

      this.countPromptLikes(promptId)
    },

    async countEntryLikes(entryId) {},

    async likeEntry(entryId) {},

    async dislikeEntry(entryId) {}
  }
})
