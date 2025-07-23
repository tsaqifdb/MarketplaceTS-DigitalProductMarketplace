'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, Filter, UserPlus, Check, X, Edit, Trash } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import RoleGuard from '@/components/guards/RoleGuard';
import { useAuth } from '@/components/providers/AuthProvider';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'seller' | 'curator' | 'admin';
  isEmailVerified: boolean;
  sellerPoints?: number;
  curatorPoints?: number;
  createdAt: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pendingCurators, setPendingCurators] = useState<User[]>([]);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/users?page=1&role=${roleFilter}&search=${searchTerm}`
        );
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data pengguna');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, searchTerm]);

  // Fetch pending curators
  useEffect(() => {
    const fetchPendingCurators = async () => {
      try {
        const response = await fetch('/api/admin/users/pending-curators');
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data kurator tertunda');
        }
        
        const data = await response.json();
        setPendingCurators(data.pendingCurators);
      } catch (error) {
        console.error('Error fetching pending curators:', error);
      }
    };

    fetchPendingCurators();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/approve-curator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyetujui kurator');
      }

      // Refresh data
      setPendingCurators(prev => prev.filter(u => u.id !== userId));
      
      // Update user in the list
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {...u, curatorPoints: 100}; // Assuming initial points is 100
        }
        return u;
      }));
      
      alert('Kurator berhasil disetujui');
    } catch (error) {
      console.error('Error approving curator:', error);
      alert('Terjadi kesalahan saat menyetujui kurator');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const reason = prompt('Alasan penolakan (opsional):');
      
      const response = await fetch('/api/admin/users/reject-curator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, reason }),
      });

      if (!response.ok) {
        throw new Error('Gagal menolak kurator');
      }

      // Refresh data
      setPendingCurators(prev => prev.filter(u => u.id !== userId));
      
      // Update user in the list
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {...u, role: 'client', curatorPoints: 0}; // Downgrade to client
        }
        return u;
      }));
      
      alert('Kurator berhasil ditolak');
    } catch (error) {
      console.error('Error rejecting curator:', error);
      alert('Terjadi kesalahan saat menolak kurator');
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      // Fetch user data first
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data pengguna');
      }
      
      const data = await response.json();
      const userToEdit = data.user;
      
      // Simple prompt-based editing for demonstration
      // In a real app, you would use a modal or form
      const newName = prompt('Nama:', userToEdit.name);
      const newEmail = prompt('Email:', userToEdit.email);
      const newRole = prompt('Peran (admin, seller, curator, client):', userToEdit.role);
      
      if (!newName || !newEmail || !newRole) {
        alert('Semua field harus diisi');
        return;
      }
      
      // Additional points based on role
      let pointsInput: string | null = null;
      if (newRole === 'seller') {
        pointsInput = prompt('Seller Points:', userToEdit.sellerPoints?.toString() || '0');
      } else if (newRole === 'curator') {
        pointsInput = prompt('Curator Points:', userToEdit.curatorPoints?.toString() || '0');
      }
      
      const updateData: any = {
        name: newName,
        email: newEmail,
        role: newRole,
      };
      
      if (newRole === 'seller') {
        updateData.sellerPoints = pointsInput ? parseInt(pointsInput) || 0 : 0;
      } else if (newRole === 'curator') {
        updateData.curatorPoints = pointsInput ? parseInt(pointsInput) || 0 : 0;
      }
      
      const updateResponse = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Gagal memperbarui pengguna');
      }
      
      const updateResult = await updateResponse.json();
      
      // Update user in the list
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return updateResult.user;
        }
        return u;
      }));
      
      alert('Pengguna berhasil diperbarui');
    } catch (error) {
      console.error('Error editing user:', error);
      alert('Terjadi kesalahan saat mengedit pengguna');
    }
  };
  
  const handleDelete = async (userId: string) => {
    try {
      if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
        return;
      }
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus pengguna');
      }
      
      // Remove user from the list
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      alert('Pengguna berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Terjadi kesalahan saat menghapus pengguna');
    }
  };
  
  const handleAddUser = async () => {
    try {
      // Simple prompt-based user creation for demonstration
      // In a real app, you would use a modal or form
      const name = prompt('Nama:');
      const email = prompt('Email:');
      const password = prompt('Password:');
      const role = prompt('Peran (admin, seller, curator, client):');
      
      if (!name || !email || !password || !role) {
        alert('Semua field harus diisi');
        return;
      }
      
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat pengguna');
      }
      
      const data = await response.json();
      
      // Add new user to the list
      setUsers(prev => [data.user, ...prev]);
      
      alert('Pengguna berhasil dibuat');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Gagal membuat pengguna: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'curator': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'seller': return 'Seller';
      case 'curator': return 'Curator';
      case 'client': return 'Client';
      default: return role;
    }
  };

  return (
    <RoleGuard requireRole="admin">
      <AdminLayout>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900">Manajemen Pengguna</h1>
              <button 
                onClick={handleAddUser}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Tambah Pengguna
              </button>
            </div>

            {/* Pending Curators Section */}
            {pendingCurators.length > 0 && (
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-100">
                <h2 className="text-lg font-medium text-yellow-800 mb-3">Pendaftaran Curator Menunggu Persetujuan</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-yellow-200">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Nama</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Tanggal Daftar</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-yellow-50 divide-y divide-yellow-200">
                      {pendingCurators.map((curator) => (
                        <tr key={curator.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{curator.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{curator.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(curator.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleApprove(curator.id)}
                                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center hover:bg-green-200"
                              >
                                <Check className="w-3 h-3 mr-1" /> Setujui
                              </button>
                              <button 
                                onClick={() => handleReject(curator.id)}
                                className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs flex items-center hover:bg-red-200"
                              >
                                <X className="w-3 h-3 mr-1" /> Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Cari pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Filter:</span>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Semua Peran</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="curator">Curator</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                              {getRoleDisplay(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.isEmailVerified ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Terverifikasi
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Belum Terverifikasi
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.role === 'seller' && user.sellerPoints !== undefined ? (
                              <span>{user.sellerPoints} poin seller</span>
                            ) : user.role === 'curator' && user.curatorPoints !== undefined ? (
                              <span>{user.curatorPoints} poin curator</span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(user.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                          Tidak ada pengguna yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Sebelumnya
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">1</span> sampai <span className="font-medium">{filteredUsers.length}</span> dari <span className="font-medium">{filteredUsers.length}</span> pengguna
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Sebelumnya</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Selanjutnya</span>
                      <ChevronLeft className="h-5 w-5 transform rotate-180" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}