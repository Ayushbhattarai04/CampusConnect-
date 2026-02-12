import React from "react";

const Setting = () => {
  return (
    <div className="flex  bg-white text-gray-800">
      <h1 className="text-violet-700 text-2xl font-bold ml-12 ">Settings</h1>
      <div className="mt-30 bg-violet-500 p-4 pr-100 rounded-lg shadow-md ml-2">
        <h3 className="text-white text-lg font-semibold">User Logout</h3>
        <p className="text-white mt-2">
          Click the button below to log out of your account and end your session.
        </p>
        <button className="bg-violet-800 text-white px-4 py-2 rounded mt-4 hover:bg-violet-1000">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Setting;
