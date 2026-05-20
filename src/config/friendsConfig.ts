import type { FriendLink } from "../types/config";

export const friendsConfig: FriendLink[] = [];

export const getEnabledFriends = (): FriendLink[] => {
	return friendsConfig
		.filter((friend) => friend.enabled)
		.sort((a, b) => b.weight - a.weight);
};
