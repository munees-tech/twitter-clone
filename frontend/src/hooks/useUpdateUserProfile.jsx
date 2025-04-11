import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base_url } from "../components/constant/url";
import toast from "react-hot-toast";

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: updateProfile, isLoading: isUpdatingProfile } = useMutation({
        mutationFn: async (formData) => {
            const res = await fetch(`${base_url}/api/users/update`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            refetch()
},
        onError: (error) => {
            toast.error(error.message || "Something went wrong");
        },
    });

    return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;