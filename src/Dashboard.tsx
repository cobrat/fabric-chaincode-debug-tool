import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CircleUser, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

interface Identity {
  affiliation: string;
  id: string;
  type: string;
  attrs: string[];
  max_enrollments: number;
}

const Dashboard: React.FC = () => {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [currentUser, setCurrentUser] = useState<Identity | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchIdentities = async () => {
      try {
        const response = await api.get("/user/identities");
        setIdentities(response.data.response.identities);
        // Assume the first identity is the current user
        setCurrentUser(response.data.response.identities[0]);
      } catch (error) {
        console.error("Failed to fetch identities:", error);
      }
    };

    fetchIdentities();
  }, []);

  const handleLogout = () => {
    logout();
    // Redirect to login page or perform other logout actions
  };

  return (
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
          <DropdownMenuLabel>My Account: {currentUser?.id}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
            Details
          </DropdownMenuItem>
          <DropdownMenuItem>Channel Discovery</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUser &&
                Object.entries(currentUser).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>
                      {Array.isArray(value)
                        ? value.join(", ")
                        : value.toString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Dashboard;
