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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

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
  type: "invoke" | "query";
  method: string;
  args: string[];
}

interface HistoryItem extends RequestForm {
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
    { type: "invoke", method: "", args: [""] },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [channelId, setChannelId] = useState("");
  const [chaincodeId, setChaincodeId] = useState("");

  const addRequest = () => {
    setRequests([...requests, { type: "invoke", method: "", args: [""] }]);
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

  const handleSubmit = async (request: RequestForm, index: number) => {
    if (!channelId || !chaincodeId) {
      alert("Please enter Channel ID and Chaincode ID");
      return;
    }

    try {
      const response = await api.post(
        `/${request.type}/${channelId}/${chaincodeId}`,
        {
          method: request.method,
          args: request.args,
        }
      );

      const newHistoryItem: HistoryItem = {
        ...request,
        response: JSON.stringify(response.data.response, null, 2),
      };

      setHistory([newHistoryItem, ...history]);

      // Optionally, clear the request form after successful submission
      setRequests(
        requests.map((req, i) =>
          i === index ? { type: "invoke", method: "", args: [""] } : req
        )
      );
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">Chaincode Functions Test</h1>

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
      </header>

      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <h2 className="text-xl font-bold">Chaincode Invoke/Query Request</h2>

        <div className="p-4">
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
            <Button onClick={handleChannelDiscovery}>Channel Discovery</Button>
            <Input
              placeholder="Chaincode ID"
              value={chaincodeId}
              onChange={(e) => setChaincodeId(e.target.value)}
            />
            <Button onClick={addRequest}>New Request</Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
          <Card  className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
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
                        Type
                      </label>
                      <Select
                        value={request.type}
                        onValueChange={(value) =>
                          updateRequest(
                            index,
                            "type",
                            value as "invoke" | "query"
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="invoke">Invoke</SelectItem>
                            <SelectItem value="query">Query</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium mb-1">
                        Method
                      </label>
                      <Input
                        value={request.method}
                        onChange={(e) =>
                          updateRequest(index, "method", e.target.value)
                        }
                        placeholder="Enter method (e.g. ContractClass:method)"
                      />
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
                            placeholder={`Arg ${argIndex + 1}`}
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
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={() => deleteRequest(index)}
                      variant="outline"
                    >
                      Delete
                    </Button>
                    <Button onClick={() => handleSubmit(request, index)}>
                      Submit
                    </Button>
                  </CardFooter>
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
                        <strong>{item.type.toUpperCase()}:</strong>{" "}
                        {item.method}
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
        </div>

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
      </main>
    </div>
  );
};

export default Dashboard;
