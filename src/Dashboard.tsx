import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { CircleUser } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";

interface Attribute {
  name: string;
  value: string;
}

interface Identity {
  id: string;
  type: string;
  affiliation: string;
  attrs: Attribute[];
  max_enrollments: number;
}

interface IdentityResponse {
  response: {
    identities: Identity[];
    caname: string;
  };
}

interface RequestForm {
  function: string;
  args: string[];
}

interface HistoryItem {
  type: "invoke" | "query";
  function: string;
  args: string[];
  response: string;
}

const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<IdentityResponse | null>(null);
  // const [channelId, setChannelId] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<IdentityResponse>("/user/identities");
        setUserInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleChannelDiscovery = async () => {
    if (!channelId) {
      alert("Please enter a Channel ID");
      return;
    }
    try {
      const response = await api.post(`/discover/${channelId}`);
      setDiscoveryResult(response.data);
      setIsDiscoveryOpen(true);
    } catch (error) {
      console.error("Channel discovery failed:", error);
      alert("Channel discovery failed. Please try again.");
    }
  };

  const formatJSON = (json: any): string => {
    const formatCertificate = (cert: string) => {
      return cert
        .split("\\n")
        .map((line) => `<span class="certificate-line">${line}</span>`)
        .join("");
    };

    return JSON.stringify(json, null, 2)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = "number";
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = "key";
            } else {
              cls = "string";
              // 检查是否是证书内容
              if (match.includes("-----BEGIN CERTIFICATE-----")) {
                return (
                  '<span class="' +
                  cls +
                  '">' +
                  formatCertificate(match.slice(1, -1)) +
                  "</span>"
                );
              }
            }
          } else if (/true|false/.test(match)) {
            cls = "boolean";
          } else if (/null/.test(match)) {
            cls = "null";
          }
          return '<span class="' + cls + '">' + match + "</span>";
        }
      );
  };

  const currentUser = userInfo?.response.identities[0];

  const [requests, setRequests] = useState<RequestForm[]>([
    { function: "", args: [""] },
  ]);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [channelId, setChannelId] = useState("");
  const [chaincodeId, setChaincodeId] = useState("");

  const addRequest = () => {
    setRequests([...requests, { function: "", args: [""] }]);
  };

  const deleteRequest = (index: number) => {
    const newRequests = requests.filter((_, i) => i !== index);
    setRequests(newRequests);
  };

  const updateRequest = (
    index: number,
    field: keyof RequestForm,
    value: string | string[]
  ) => {
    const newRequests = [...requests];
    newRequests[index] = { ...newRequests[index], [field]: value };
    setRequests(newRequests);
  };

  const addArg = (requestIndex: number) => {
    const newRequests = [...requests];
    newRequests[requestIndex].args.push("");
    setRequests(newRequests);
  };

  const removeArg = (requestIndex: number, argIndex: number) => {
    const newRequests = [...requests];
    newRequests[requestIndex].args = newRequests[requestIndex].args.filter(
      (_, i) => i !== argIndex
    );
    setRequests(newRequests);
  };

  const handleSubmit = async (type: "invoke" | "query") => {
    try {
      const responses = await Promise.all(
        requests.map(async (request) => {
          const response = await api.post(
            `/${type}/${channelId}/${chaincodeId}`,
            {
              method: request.function,
              args: request.args,
            }
          );
          return response.data.response;
        })
      );

      const newHistoryItems: HistoryItem[] = requests.map((request, index) => ({
        type,
        function: request.function,
        args: request.args,
        response: JSON.stringify(responses[index], null, 2),
      }));

      setHistory([...newHistoryItems, ...history]);
    } catch (error) {
      console.error("Error submitting request:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-4 flex-grow">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">ChannelID</span>
            <Input
              className="w-40"
              placeholder="Enter Channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">ChaincodeID</span>
            <Input
              className="w-40"
              placeholder="Enter Chaincode ID"
              value={chaincodeId}
              onChange={(e) => setChaincodeId(e.target.value)}
            />
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
            <DropdownMenuItem onSelect={handleChannelDiscovery}>
              Channel Discovery
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {currentUser && (
              <div className="space-y-4">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">ID</TableCell>
                      <TableCell>{currentUser.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Type</TableCell>
                      <TableCell>{currentUser.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Affiliation</TableCell>
                      <TableCell>{currentUser.affiliation || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Max Enrollments
                      </TableCell>
                      <TableCell>{currentUser.max_enrollments}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Attributes</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUser.attrs.map((attr, index) => (
                        <TableRow key={index}>
                          <TableCell>{attr.name}</TableCell>
                          <TableCell>{attr.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    CA Name: {userInfo?.response.caname}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Channel Discovery Dialog */}
        <Dialog open={isDiscoveryOpen} onOpenChange={setIsDiscoveryOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Channel Discovery Result</DialogTitle>
            </DialogHeader>
            <div className="json-viewer">
              <pre
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: formatJSON(discoveryResult),
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="p-4">
          <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-2xl font-bold">
              Chaincode Invoke/Query Request
            </h2>
            <Button onClick={addRequest}>New</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {requests.map((request, index) => (
                <Card key={index} className="mb-4">
                  <CardHeader>
                    <CardTitle>Request {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">
                        Function
                      </label>
                      <Select
                        value={request.function}
                        onValueChange={(value) =>
                          updateRequest(index, "function", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select function" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="invoke">Invoke</SelectItem>
                            <SelectItem value="query">Query</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Args
                      </label>
                      {request.args.map((arg, argIndex) => (
                        <div key={argIndex} className="flex mb-2">
                          <Input
                            value={arg}
                            onChange={(e) => {
                              const newArgs = [...request.args];
                              newArgs[argIndex] = e.target.value;
                              updateRequest(index, "args", newArgs);
                            }}
                            className="flex-grow"
                          />
                          <Button
                            onClick={() => removeArg(index, argIndex)}
                            className="ml-2"
                          >
                            -
                          </Button>
                          {argIndex === request.args.length - 1 && (
                            <Button
                              onClick={() => addArg(index)}
                              className="ml-2"
                            >
                              +
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button onClick={() => deleteRequest(index)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.map((item, index) => (
                    <div key={index} className="mb-4">
                      <p>
                        <String>{item.type.toUpperCase()}:</String>{" "}
                        {item.function}
                      </p>
                      <p>
                        <strong>Args:</strong> {item.args.join(", ")}
                      </p>
                      <pre className="bg-gray-100 p-2 rounded mt-2">
                        {item.response}
                      </pre>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => handleSubmit("invoke")} className="mr-2">
              Invoke
            </Button>
            <Button onClick={() => handleSubmit("query")}>Query</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
