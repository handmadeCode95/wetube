import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
	res.render("join", {pageTitle: "Join"});
};
export const postJoin = async (req, res) => {
	const {name, username, email, password, password2, location} = req.body;
	const pageTitle = "Join";
	
	if(password !== password2) {
		req.flash("error", "Password confirmation dose not match.");
		return res.status(400).render("join", {pageTitle});
	};
	
	const usernameExists = await User.exists( { $or: [{username}, {email}] } );
	if(usernameExists) {
		req.flash("error", "This username/email is already taken.");
		return res.status(400).render("join", {pageTitle});
	};
	
	try {
		await User.create({
			name,
			username,
			email,
			password,
			location,
		});
		req.flash("info", "Join complete.");
		return res.redirect("/login");
	} catch(error) {
		req.flash("error", error._message);
		return res.status(400).render("join", {pageTitle});
	};
};

export const getLogin = (req, res) => {
	res.render("login", {pageTitle: "Login"});
};

export const postLogin = async (req, res) => {
	const {username, password} = req.body;
	const pageTitle = "Login";
	const user = await User.findOne({username, socialOnly: false});
	
	if(!user) {
		req.flash("error", "An account with this username dose not exists.");
		return res.status(400).render("login", {pageTitle});
	};
	
	const match = await bcrypt.compare(password, user.password);
	if(!match) {
		req.flash("error", "Wrong password");
		return res.status(400).render("login", {pageTitle});
	};
	
	req.session.loggedIn = true;
	req.session.user = user;
	req.flash("info", "Login complete.");
	return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
	const baseUrl = "https://github.com/login/oauth/authorize";
	const config = {
		client_id: process.env.GH_CLIENT,
		allow_signup: false,
		scope: "read:user user:email",
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	
	return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
	const baseUrl = "https://github.com/login/oauth/access_token";
	const config = {
		client_id: process.env.GH_CLIENT,
		client_secret: process.env.GH_SECRET,
		code: req.query.code,
	};
	const params = new URLSearchParams(config).toString();
	const finalUrl = `${baseUrl}?${params}`;
	
	const tokenRequest = await (
		await fetch(finalUrl, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		})
	).json();
	
	if("access_token" in tokenRequest) {
		const { access_token } = tokenRequest;
		const apiUrl = "https://api.github.com";
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				}
			})
		).json();
		
		const emailData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				}
			})
		).json();
		
		const emailObj = emailData.find(
			(email) => email.primary === true && email.verified === true
		);
		if(!emailObj) {
			return res.redirect("/login");
		};
		
		let user = await User.findOne({email: emailObj.email});
		if(!user) {
			user = await User.create({
				name: userData.name,
				username: userData.login,
				email: emailObj.email,
				password: "",
				socialOnly: true,
				avatarUrl: userData.avatar_url,
				location: userData.location,
			});
		};
		req.session.loggedIn = true;
		req.session.user = user;
		req.flash("info", "Login complete.");
		return res.redirect("/");
	} else {
		return res.redirect("/login");
	};
};

export const logout = (req, res) => {
	req.session.user = null;
	req.session.loggedIn = false;
	req.flash("info", "Logout complete.");
	return res.redirect("/");
};

export const getEdit = (req, res) => {
	return res.render("users/edit-profile", {pageTitle: "Edit Profile"});
};

export const postEdit = async (req, res) => {
	const {
		session: {
			user: {_id, username, email, avatarUrl},
		},
		body: {name, email: newEmail, username: newUsername, location},
		file,
	} = req;
	
	if(username === newUsername) {
		const usernameExists = await User.exists(username);
		if(usernameExists) {
			req.flash("error", "This username is already taken.");
			return res.status(400).render("users/edit-profile", {pageTitle: "Edit Profile"});
		};
	};
	if(email === newEmail) {
		const emailExists = await User.exists(email);
		if(emailExists) {
			req.flash("error", "This email is already taken.");
			return res.status(400).render("users/edit-profile", {pageTitle: "Edit Profile"});
		};
	};
	
	const isHeroku = process.env.NODE_ENV === "production";
	const updatedUser = await User.findByIdAndUpdate(
		_id, {
			avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
			name,
			email,
			username,
			location,
		}, {new: true}
	);
	req.session.user = updatedUser;
	req.flash("success", "Profile updated.");
	return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
	if(req.session.user.socialOnly === true) {
		req.flash("error", "Can't change password.");
		return res.redirect("/");
	};
	return res.render("users/change-password", {pageTitle: "Change Password"});
};

export const postChangePassword = async (req, res) => {
	const pageTitle = "Change Password";
	
	const {
		session: {
			user: {_id},
		},
		body: {oldPassword, newPassword, newPassword2},
	} = req;
	const user = await User.findById(_id);
	
	const match = await bcrypt.compare(oldPassword, user.password);
	if(!match) {
		req.flash("error", "The current password is incorrect.");
		return res.status(400).render("users/change-password", {pageTitle});
	};
	
	if(newPassword !== newPassword2) {
		req.flash("error", "The new password confirmation dose not match.");
		return res.status(400).render("users/change-password", {pageTitle});
	};
	
	user.password = newPassword;
	await user.save();
	req.flash("success", "Password updated.");
	return res.redirect("/users/logout");
};

export const see = async (req, res) => {
	const {id} = req.params;
	const user = await User.findById(id).populate({
		path: "videos",
		populate: {
			path: "owner",
			model: "User",
		},
	});
	if(!user) {
		return res.status(404).render("404", {pageTitle: "User not found."});
	};
	return res.render("users/profile", {pageTitle: user.name, user});
};