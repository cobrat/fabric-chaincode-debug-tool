import React from "react";
import { CircleUser, Link, Menu, MoreVertical, Package2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-4 flex-grow">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">ChannelID</span>
            <Input className="w-40" placeholder="Enter Channel ID" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">ChaincodeID</span>
            <Input className="w-40" placeholder="Enter Chaincode ID" />
          </div>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Details</DropdownMenuItem>
              <DropdownMenuItem>Channel Discovery</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </header>
    </div>
  );
};

export default Dashboard;
