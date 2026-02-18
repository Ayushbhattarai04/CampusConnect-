"use client";
import React, { useState, useEffect } from "react";
import {
  Shield,
  Palette,
  Moon,
  Sun,
  Monitor,
  Key,
  Trash2,
  Download,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("appearance");
  const [showPassword, setShowPassword] = useState(false);
  const [dark, setDark] = useState(false);

  const tabs = [
    { id: "appearance", label: "Appearance & Preferences", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];
  
  const theme = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                    <ChevronRight
                      size={16}
                      className={`ml-auto ${
                        activeTab === tab.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Appearance & Preferences */}
              
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Appearance & Preferences
                  </h2>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Theme
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >

                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition">
                          <Sun size={32} className="text-gray-600" />
                          <span className="font-medium">Light</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition">
                          <Moon onClick={() => setDark(true)} size={32} className="text-gray-600" />
                          <span className="font-medium">Dark</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition">
                          <Monitor size={32} className="text-gray-600" />
                          <span className="font-medium">System</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Security & Privacy
                  </h2>

                  {/* Change Password */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Key size={20} className="text-blue-600" />
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Download Data */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Download className="text-blue-600 mt-1" size={20} />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Download Your Data
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Get a copy of your information
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Section (visible on all tabs) */}
              <div className="mt-8 pt-8 border-t">
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <LogOut className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Logout
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Click the button below to log out of your account and
                        end your session.
                      </p>
                      <button
                        onClick={() => {
                          localStorage.removeItem("token");
                          window.location.href = "/auth/login";
                        }}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium inline-flex items-center gap-2"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="mt-6 bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Trash2 className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <button className="px-6 py-2.5 bg-white border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition font-medium inline-flex items-center gap-2">
                        <Trash2 size={18} />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
