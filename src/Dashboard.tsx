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
  DialogTrigger,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import api from "@/lib/api";
import { ModeToggle } from "./ModeToggle";

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

interface HistoryItem {
  type: string;
  method: string;
  args: string[];
  response: string;
}

const ITEMS_PER_PAGE = 5;

const Dashboard: React.FC = () => {
  const [userInfo, setUserInfo] = useState<IdentityResponse | null>(null);
  // const [channelId, setChannelId] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

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
      toast({
        title: "Missing information",
        description: "Please enter Channel ID and Chaincode ID",
        variant: "destructive",
      });
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

      toast({
        title: "Request submitted",
        description: `${
          request.type.charAt(0).toUpperCase() + request.type.slice(1)
        } request for ${request.method} was successful.`,
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [currentPage, setCurrentPage] = useState(1);

  // 计算总页数
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

  // 获取当前页的数据
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return history.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between p-4 bg-background shadow-sm">
        <h1 className="text-2xl font-bold">Chaincode Functions Test</h1>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                My Account: {currentUser?.id}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)}>
                Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
        {/* <h2 className="text-xl font-bold">Chaincode Invoke/Query Request</h2> */}

        <div className="p-4">
          <div className="flex space-x-4 mb-4">
            <Input
              placeholder="Channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
            <Input
              placeholder="Chaincode ID"
              value={chaincodeId}
              onChange={(e) => setChaincodeId(e.target.value)}
            />
            <Button onClick={handleChannelDiscovery}>Channel Discovery</Button>
          </div>

          <div className="grid gap-4">
            {/* Requests Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Requests Lists</CardTitle>
                    <CardDescription>
                      Setup your chaincode requests and submit them.
                    </CardDescription>
                  </div>
                  <Button onClick={addRequest}>New Request</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {requests.map((request, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Request {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
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
                          <div>
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
              </CardContent>
            </Card>

            {/* History Card */}
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>
                  View the history of your chaincode requests and their
                  responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Args</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData().map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.type.toUpperCase()}</TableCell>
                        <TableCell>{item.method}</TableCell>
                        <TableCell>{item.args.join(", ")}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setSelectedResponse(item.response)
                                }
                              >
                                View Response
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>Response Details</DialogTitle>
                              </DialogHeader>
                              <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
                                {selectedResponse}
                              </pre>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                          />
                        </PaginationItem>
                      )}
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
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
