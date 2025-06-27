import Card from '@/components/atoms/Card'

const Loading = ({ type = 'card', count = 3 }) => {
  if (type === 'table') {
    return (
      <div className="space-y-4">
        {/* Table header skeleton */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-4 bg-gray-200 rounded shimmer"></div>
            <div className="h-4 bg-gray-200 rounded shimmer"></div>
            <div className="h-4 bg-gray-200 rounded shimmer"></div>
            <div className="h-4 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
        
        {/* Table rows skeleton */}
        <div className="space-y-2">
          {[...Array(count)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded shimmer"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-full shimmer"></div>
                <div className="h-4 w-12 bg-gray-200 rounded shimmer"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded shimmer"></div>
                <div className="h-8 w-16 bg-gray-200 rounded shimmer"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (type === 'calendar') {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 rounded shimmer"></div>
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded shimmer"></div>
              <div className="h-8 w-8 bg-gray-200 rounded shimmer"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded shimmer"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded border shimmer"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded shimmer"></div>
              <div className="h-3 w-48 bg-gray-200 rounded shimmer"></div>
              <div className="h-3 w-24 bg-gray-200 rounded shimmer"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full shimmer"></div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default Loading