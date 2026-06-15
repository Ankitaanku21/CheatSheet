import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get(`/users/verify/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-zinc-800 p-10 rounded-xl shadow-lg w-full max-w-md text-center border border-zinc-700">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verifying...</h1>
            <p className="text-zinc-400">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle size={56} className="mx-auto text-green-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <Link to="/login" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-500">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <FiXCircle size={56} className="mx-auto text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-zinc-400 mb-6">{message}</p>
            <Link to="/login" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-500">Go to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}