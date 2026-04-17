package com.groupxx.smartcampus.auth.dto;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(max = 255, message = "Name must be 255 characters or fewer")
    private String name;

    @Size(max = 1000000, message = "Profile picture data is too large")
    private String profilePicture;

    @Size(max = 30, message = "Phone number must be 30 characters or fewer")
    private String phoneNumber;

    @Size(max = 120, message = "Department must be 120 characters or fewer")
    private String department;

    @Size(max = 120, message = "Faculty must be 120 characters or fewer")
    private String faculty;

    @Size(max = 255, message = "Address must be 255 characters or fewer")
    private String address;

    @Size(max = 1000, message = "Bio must be 1000 characters or fewer")
    private String bio;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
